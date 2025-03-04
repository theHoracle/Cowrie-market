import AWS from "aws-sdk";

const s3Bucket = new AWS.S3({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_KEY,
});

type UploadImageProps = {
  file: File;
  slug: string;
};

async function uploadImage({ file, slug }: UploadImageProps) {
  const bucketName = "cowrie-marketplace-listings-image";
  const fileName = slug;

  try {
    const data = await s3Bucket.upload({
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: file.type,
    });
    const upload = await data.promise();
    const url = upload.Location;
    return url;
  } catch (error) {
    console.log("Error occurred during upload: ", error);
  }
}

export { uploadImage };
