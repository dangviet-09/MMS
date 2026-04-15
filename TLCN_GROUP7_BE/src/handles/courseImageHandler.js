const db = require("../models");
const cloudinary = require("../configs/cloudinary");

class CourseImageHandler {
  async upload(bufferBase64) {
    const buffer = Buffer.from(bufferBase64, "base64");
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "courses", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });
    return uploadResult;
  }

  async delete(publicId) {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  }

  async handleCourseImage({ courseId, bufferBase64, type, oldPublicId }) {
    // Lấy course
    const course = await db.CareerPath.findByPk(courseId);
    if (!course) throw new Error("Course không tồn tại");

    switch (type) {
      case "CREATE":
        if (!bufferBase64) throw new Error("Missing image for CREATE");
        {
          const uploadResult = await this.upload(bufferBase64);
          await course.update({
            image: uploadResult.secure_url,
            publicId: uploadResult.public_id
          });
        }
        break;

      case "UPDATE":
        if (!bufferBase64) throw new Error("Missing image for UPDATE");
        // Xóa ảnh cũ trước
        if (oldPublicId) {
          await this.delete(oldPublicId);
        }
        {
          const uploadResult = await this.upload(bufferBase64);
          await course.update({
            image: uploadResult.secure_url,
            publicId: uploadResult.public_id
          });
        }
        break;

      case "DELETE":
        if (oldPublicId) {
          await this.delete(oldPublicId);
        }
        break;

      default:
        throw new Error("Unknown course image event type: " + type);
    }
  }
}

module.exports = new CourseImageHandler();
