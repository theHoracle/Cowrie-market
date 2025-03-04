"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initializeExecutionClient } from "@/contract/contract";
import { useListNewProduct } from "@/contract/hooks";
import { uploadImage } from "@/aws/aws-s3";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a valid positive number",
  }),
  tokenDenom: z.string().min(1, {
    message: "Token denomination is required",
  }),
  image: z
    .any()
    .refine((files) => files?.length >= 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max image size is 5MB",
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported",
    ),
});

export function MarketplaceListingForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  {
    /*
  const createListingMutation = useCowrieMarketplaceCreateListingMutation({
    onSuccess: (data) => {
      console.log("Listing created successfully", data);
      // Add your success handling here
    },
    onError: (error) => {
      console.error("Error creating listing", error);
      // Add your error handling here
    },
  });
  */
  }

  const {
    mutate: listProduct,
    isPending,
    isError,
    isSuccess,
  } = useListNewProduct();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      tokenDenom: "",
    },
  });

  const upload = async (file: File) => {
    if(!file && !form.getValues().title) {
      console.log("No file detected or title added")
      return;
    }
    setIsUploading(true);
    try {
      if()
      const url = await uploadImage()
      setImageUrl("https://example.com/placeholder.jpg");
    } catch (error) {
      console.error("Error uploading image:", error);
      form.setError("image", {
        message: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!imageUrl) {
      form.setError("image", {
        message: "Please wait for image upload to complete",
      });
      return;
    }

    const { mutate } = useListNewProduct();

    {
      /*
    createListingMutation.mutate({
      client: {}, // Add your client configuration here
      msg: {
        title: values.title,
        description: values.description,
        price: values.price as unknown as Uint128, // You might need proper conversion here
        imageUrl: imageUrl,
        tokenDenom: values.tokenDenom,
      },
    });
    */
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(e.target.files);
                      upload(file);
                    }
                  }}
                  {...field}
                  className="h-52 flex text-center "
                />
              </FormControl>
              <FormDescription>
                Upload an image (max 5MB, JPG/PNG/WebP)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Amazing NFT Collection" {...field} />
              </FormControl>
              <FormDescription>
                Give your listing a catchy title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your listing in detail..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tokenDenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Denomination</FormLabel>
                <FormControl>
                  <Input placeholder="ATOM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isUploading
            ? "Uploading..."
            : isPending
              ? "Creating..."
              : "Create Listing"}
        </Button>
      </form>
    </Form>
  );
}

export default MarketplaceListingForm;
