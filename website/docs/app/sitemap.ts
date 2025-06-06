import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";
import { getBlogPostsFromNotion } from "@/lib/notion";

const BASE_URL = "https://nuwa.dev";

function getAllNipSlugs() {
  const nipsDir = path.join(process.cwd(), "/content/nips");
  return fs
    .readdirSync(nipsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

function getAllDocsSlugs() {
  const docsDir = path.join(process.cwd(), "/content");
  return fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const defaultPages = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  const nips = getAllNipSlugs().map((slug) => ({
    url: `${BASE_URL}/nips/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const docs = getAllDocsSlugs().map((slug) => ({
    url: `${BASE_URL}/docs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const blogPosts = await getBlogPostsFromNotion(
    process.env.NOTION_BLOG_DATABASE_ID!
  );
  const blogs = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.lastEditAt ? new Date(post.lastEditAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...defaultPages, ...nips, ...docs, ...blogs];
}
