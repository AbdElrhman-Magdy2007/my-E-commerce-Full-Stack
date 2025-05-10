// // next.config.ts
 
 // import { NextConfig } from "next";
 
 // const nextConfig: NextConfig = {
 //   experimental: {
 //     serverActions: {
 //       bodySizeLimit: "5mb", // Increase max body size to 5MB
 //     },
 //   },
 //   images: {
 //     remotePatterns: [
 //       {
 //         protocol: "https",
 //         hostname: "**", // Allow images from any hostname
 //       },
 //     ],
 //   },
 //   webpack(config) {
 //     // Add rule for handling .mp4, .jpeg, .jpg, .svg, .png files
 //     config.module.rules.push({
 //       test: /\.(mp4|jpeg|jpg|svg|png)$/,
 //       type: "asset/resource",
 //       generator: {
 //         filename: "static/media/[name].[hash][ext]", // Output to static/media/
 //       },
 //     });
 //     return config;
 //   },
 // };
 
 // export default nextConfig;
 
 
 import { NextConfig } from "next";
 
 const nextConfig: NextConfig = {
   experimental: {
     serverActions: {
       bodySizeLimit: "5mb",
     },
   },
   images: {
     remotePatterns: [
       {
         protocol: "https",
         hostname: "**",
       },
       {
         protocol: "http",
         hostname: "localhost",
         port: "3000",
         pathname: "/uploads/**",
       },
     ],
   },
   webpack(config) {
     config.module.rules.push({
       test: /\.(mp4|jpeg|jpg|svg|png)$/,
       type: "asset/resource",
       generator: {
         filename: "static/media/[name].[hash][ext]",
       },
     });
     return config;
   },
 };
 
 export default nextConfig;