const db = require("../models");
const cloudinary = require("../configs/cloudinary");
const { getOAuthDrive } = require("../configs/googleDrive");;

class ChallengeTestHandler {
  async handleEvent(event) {
    const { challengeTestId, type } = event;
    if (!challengeTestId || !type) return;

    const challenge = await db.ChallengeTest.findByPk(challengeTestId);
    if (!challenge) return;

    switch (type) {
      case "CREATE":
        await this.handleCreate(challenge, event);
        break;

      case "UPDATE":
        await this.handleUpdate(challenge, event);
        break;

      case "DELETE":
        await this.handleDelete(challenge, event);
        break;

      default:
        console.warn("UNKNOWN EVENT:", type);
    }
  }


  async handleCreate(challenge, event) {
    let imageUrl = null;
    let publicId = null;
    let fileUrl = null;

    // Upload image nếu có
    if (event.imageBase64) {
      const upload = await cloudinary.uploader.upload(
        `data:image/png;base64,${event.imageBase64}`,
        { folder: "challenge_tests" }
      );
      imageUrl = upload.secure_url;
      publicId = upload.public_id;
    }

    // Upload file nếu có
    if (event.fileBase64 && event.fileName) {
      fileUrl = await this.uploadToDrive(event.fileBase64, event.fileName);
    }

    await challenge.update({
      image: imageUrl,
      publicId,
      fileUrl
    });
  }


  async handleUpdate(challenge, event) {
    let imageUrl = challenge.image;
    let publicId = challenge.publicId;
    let fileUrl = challenge.fileUrl;

    // Xóa ảnh cũ nếu có
    if (event.imageBase64 && event.oldImagePublicId) {
      await cloudinary.uploader.destroy(event.oldImagePublicId);
    }

    // Upload ảnh mới
    if (event.imageBase64) {
      const upload = await cloudinary.uploader.upload(
        `data:image/png;base64,${event.imageBase64}`,
        { folder: "challenge_tests" }
      );
      imageUrl = upload.secure_url;
      publicId = upload.public_id;
    }

    // Upload file mới nếu có
    if (event.fileBase64 && event.fileName) {
      fileUrl = await this.uploadToDrive(event.fileBase64, event.fileName);
    }

    await challenge.update({
      image: imageUrl,
      publicId,
      fileUrl
    });
  }


  async handleDelete(challenge, event) {
    if (event.oldImagePublicId) {
      await cloudinary.uploader.destroy(event.oldImagePublicId);
    }
  }


 async uploadToDrive(base64, fileName) {
  const drive = getOAuthDrive();

  const buffer = Buffer.from(base64, "base64");
  const { PassThrough } = require("stream");
  const stream = new PassThrough();
  stream.end(buffer);

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: "application/octet-stream",
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],  // <-- Đây là thư mục bạn muốn lưu file vào (ID của folder)
    },
    media: {
      mimeType: "application/octet-stream",
      body: stream,
    }
  });

  // Thiết lập quyền đọc cho tất cả mọi người (tùy theo yêu cầu)
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  // Trả về URL của file vừa upload
  return `https://drive.google.com/uc?export=download&id=${file.data.id}`;
}


}

module.exports = new ChallengeTestHandler();
