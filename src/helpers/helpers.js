export const findPublicId = (url) => {
  return url.split("/")[url.split("/").length - 1].split(".")[0];
};

export const findPublicIdWithFolder = (url) => {
  // URL থেকে ফোল্ডার এবং public_id বের করা
  const pathParts = url.split("/");

  // ফোল্ডার এবং public_id আলাদা করা
  const folder = pathParts[pathParts.length - 2];
  const publicId = pathParts[pathParts.length - 1].split(".")[0];

  return `${folder}/${publicId}`;
};
