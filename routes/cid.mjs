import express from "express";
import { pinata } from "../config.js";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "tmp" });
const router = express.Router();

router.post("/", upload.single("osap"), async function (req, res) {
  try {
    const file = req.file;
    if (req.method === "POST") {
      if (!file) {
        console.log("no file");
      }

      console.log(file);

      const fileOptions = {
        pinataMetadata: {
          name: file.originalname,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      const path = file.path;
      console.log(path);
      async function mana(buffer) {
        const ext = file.mimetype.slice(6);
        const filePath = `images/${fileOptions.pinataMetadata.name}.${ext}`;
        console.log(filePath);
        fs.writeFileSync(`${filePath}`, buffer);

        if (filePath) {
          const download = fs.createReadStream(filePath);
          console.log();
          const pinned = await pinata.pinFileToIPFS(download, fileOptions);
          if (pinned) {
            console.log(pinned.IpfsHash);
            const ipfsCid = pinned.IpfsHash;
            const obj = {
              cid: ipfsCid,
              title: fileOptions.pinataMetadata.name,
            };
            res.status(200).json({ msg: obj });
          }
          fs.unlink(path, function (err) {
            console.log(path + " was deleted.");
          });
        }
      }

      fs.readFile(path, (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        if (data) {
          //console.log(data);
          mana(data);
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end("Error reading file");
  }
});

export default router;
