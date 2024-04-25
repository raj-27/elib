import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from "node:fs";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";

// Creating new Document(Book) in the database
const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  try {
    const files = req.files as { [filename: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const filename = files.coverImage[0].filename;
    const filepath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      filename
    );
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: filename,
      folder: "book-cover",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );
    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // Delete Temporary file
    try {
      await fs.promises.unlink(filepath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log(error);
    }

    res.status(201).json({ id: newBook._id });
  } catch (err) {
    const error = createHttpError(
      500,
      "Error while uploading file to cloudinary"
    );
    return next(error);
  }
};

// Updating Single Document by id
const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book"));
  }

  const files = req.files as { [filename: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage?.[0]?.filename;
    const coverMimeType = files.coverImage?.[0]?.mimetype?.split("/").at(-1);
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    completeCoverImage = filename;
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: completeCoverImage,
        folder: "book-covers",
        format: coverMimeType,
      });
      completeCoverImage = uploadResult?.secure_url;
      await fs.promises.unlink(filePath);
    } catch (error) {
      return next(
        createHttpError(400, "Error while uploading cover image to cloudinary")
      );
    }
  }
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads" + files.file?.[0]?.filename
    );
    const bookFileName = files.file?.[0]?.filename;
    completeFileName = bookFileName;
    try {
      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: completeFileName,
        folder: "book-pdf",
        format: "pdf",
      });
      completeFileName = uploadResultPdf?.secure_url;
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      return next(
        createHttpError(400, "Error While uploading  PDF to cloudinary")
      );
    }
  }

  try {
    bookModel.findByIdAndUpdate;
    const updatedBook = await bookModel.findByIdAndUpdate(
      bookId,
      {
        title,
        genre,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completeFileName ? completeFileName : book.file,
      },
      { new: true } // returns the modified document rather than the original
    );

    res.json(updatedBook);
  } catch (error) {
    return next(createHttpError(400, "Error While Updating Book"));
  }
};

// Get List of book from database
const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookList = await bookModel.find();
    res.status(200).json(bookList);
  } catch (error) {
    return next(createHttpError(501, "Error while getting document"));
  }
};

// Getting single book by id
const getBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findById(bookId);
    res.json(book);
  } catch (error) {
    return next(
      createHttpError(500, `Error while fetching document by id ${bookId}`)
    );
  }
};

// Delete single book by using id
const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(
        createHttpError(
          "404",
          `Document does not exist with this id(${bookId})`
        )
      );
    }
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "You can not delete others book"));
    }

    // Process for coverimage
    const coverFileSplits = book.coverImage.split("/");
    const coverImagePublicId =
      coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".")?.at(-2);
    console.log({ coverFileSplits, coverImagePublicId });

    // Process for file
    const bookFileSplits = book.file.split("/");
    const bookFilePublicId =
      bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);

    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookFilePublicId, {
      resource_type: "raw",
    });
    await bookModel.deleteOne({ _id: bookId });
    res.status(204).json({ message: `Document deleted with id:${bookId}` });
  } catch (error) {
    return next(
      createHttpError(500, `Error while delete book by id ${bookId}`)
    );
  }
};

export { createBook, updateBook, getBooks, getBook, deleteBook };
