import express from "express";
import { pinata } from "../config.js";
import CID from "cids";
import multer from "multer";
import fs from "fs";

const storage = multer.memoryStorage();
const upload = multer({ dest: "tmp/" });
const router = express.Router();

//Function to convert hexstring to base 64
export function hexToBase64(hexStr) {
  let base64 = "";
  for (let i = 0; i < hexStr.length; i++) {
    base64 += !((i - 1) & 1)
      ? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16))
      : "";
  }
  return btoa(base64);
}

//Funtion to find image integrity from imageHash
export function encodeCID(cid) {
  //Convert CID to version 1
  const cidV1 = new CID(cid).toV1().toString("base32");
  const hex = new CID(cidV1).toString("base16").substring(9);
  let base64 = hexToBase64(hex);
  return base64;
}

router.post("/", upload.single("img"), async function (req, res) {
  try {
    const file = req.file;
    if (req.method === "POST") {
      if (!file) {
        console.log("no file");
      }
      const imageOptions = {
        pinataMetadata: {
          name: "chaincraft-web",
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      const path = file.path;
      console.log(path)
      async function mana(buffer) {
        const ext = file.mimetype.slice(6);
        const filePath = `images/${imageOptions.pinataMetadata.name}.${ext}`;
        console.log(filePath);
        fs.writeFileSync(`${filePath}`, buffer);

        if (filePath) {
          const image = fs.createReadStream(filePath);
          console.log();
          const imagePinned = await pinata.pinFileToIPFS(image, imageOptions);
          if (imagePinned)  {
            console.log(imagePinned.IpfsHash);
            const ipfsCid = imagePinned.IpfsHash;
            const integrity = encodeCID(ipfsCid);
            const imageIntegrity = "sha256-" + integrity;
            const obj = {
              ipfsCid: ipfsCid,
              imageIntegrity: imageIntegrity,
            };
            res.status(200).json(obj);
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

router.post("/pinMeta", upload.single("img"), async function (req, res) {
  try {
    const file = req.file;
    if (req.method === "POST") {
      if (!file) {
        console.log("no file");
      }

      const imageOptions = {
        pinataMetadata: {
          name: "chaincraft-web",
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      const buffer = req.file.buffer;
      const ext = file.mimetype.slice(6);
      const filePath = `images/${imageOptions.pinataMetadata.name}.${ext}`;
      console.log(filePath);
      fs.writeFileSync(`${filePath}`, buffer);

      if (filePath) {
        const image = fs.createReadStream(filePath);
        console.log();
        const imagePinned = await pinata.pinFileToIPFS(image, imageOptions);
        if (imagePinned) {
          console.log(imagePinned.IpfsHash);
          const ipfsCid = imagePinned.IpfsHash;
          const integrity = encodeCID(ipfsCid);
          const imageIntegrity = "sha256-" + integrity;
          const obj = {
            ipfsCid: ipfsCid,
            imageIntegrity: imageIntegrity,
          };
          res.status(200).json(obj);
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end("Error reading file");
  }
});

export default router;
