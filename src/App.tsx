import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { getImages, likeImage } from "./service/images";
import {
  Button,
  Card,
  Col,
  Image,
  Layout,
  Row,
  Spin,
  notification,
} from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Meta from "antd/es/card/Meta";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";
import Search from "antd/es/input/Search";
import Fuse from "fuse.js";
import "./app.css";
import { ImageI } from "./models/image";

const PAGE_SIZE = 10;
const LOCAL_KEY = "liked-images-persistency";

const fuse = new Fuse<ImageI>([], {
  keys: ["title", "author"],
});

function App() {
  const [likedItems, setLikedItems] = useLocalStorage<string[]>(LOCAL_KEY, []);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<ImageI[] | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [api, contextHolder] = notification.useNotification();
  const { data } = useInfiniteQuery({
    queryKey: ["images-get"],
    queryFn: ({ pageParam = 1 }) => getImages(Number(pageParam), PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (_l, _a, lastPage) => {
      return lastPage + 1;
    },
  });

  const mappedItems = useMemo(
    () =>
      searchResults ||
      data?.pages?.flat().map((image) => {
        const userLiked = likedItems.find((i) => i === image.id);

        return {
          ...image,
          liked: userLiked,
          likes_count: image.likes_count + (userLiked ? 1 : 0),
        };
      }),
    [data, likedItems, searchResults]
  );

  const { mutateAsync: likeImageAsync } = useMutation({
    mutationKey: ["image-like"],
    mutationFn: likeImage,
  });

  const handleLikeImage = useCallback(
    async (id: string) => {
      try {
        await likeImageAsync(id);
        api.success({
          message: "Liked successfully :)",
        });

        setLikedItems([...likedItems, id]);
      } catch (err) {
        api.error({
          message: "Error liking image :(",
        });
        console.error(err);
      }
    },
    [api, likeImageAsync, likedItems, setLikedItems]
  );

  const handleUnlikeImage = useCallback(
    async (id: string) => {
      try {
        // here will be an api call to unlike
        setLikedItems(likedItems.filter((l) => l !== id));

        api.success({
          message: "Your like was successfully removed :)",
        });
      } catch (err) {
        api.error({
          message: "Error removing your like :(",
        });
        console.error(err);
      }
    },
    [api, likedItems, setLikedItems]
  );

  useEffect(() => {
    const flattenData = data?.pages?.flat() || [];

    for (const item of flattenData) {
      fuse.add(item);
    }
  }, [data]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults(null);
      return;
    }
    const searchResults = fuse.search(debouncedSearchTerm);

    console.log({ debouncedSearchTerm, searchResults });
    setSearchResults(searchResults.map((i) => i.item));
  }, [debouncedSearchTerm]);

  return (
    <Layout>
      {contextHolder}
      <Header>
        <Search
          placeholder="You're looking for something?"
          onChange={(e) => {
            return setSearchTerm(e.target.value);
          }}
          allowClear
        />
      </Header>
      <Content>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify="center">
          {mappedItems?.map((image) => (
            <Col>
              <Card
                cover={
                  <Image
                    alt="attachment img"
                    src={image.main_attachment.big}
                    placeholder={
                      <div className="image-attachment-loading">
                        <Spin size="large" />
                      </div>
                    }
                  />
                }
                className="image-card"
              >
                <Meta
                  title={image.title}
                  description={
                    <div className="image-description-wrapper">
                      <p>By {image.author}</p>
                      <Button
                        onClick={() =>
                          image.liked
                            ? handleUnlikeImage(image.id)
                            : handleLikeImage(image.id)
                        }
                      >
                        {image.liked ? <HeartFilled /> : <HeartOutlined />}
                        {image.likes_count}
                      </Button>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
