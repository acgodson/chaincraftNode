import { Router } from "express";
var router = Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("index", { title: "forge-ahead" });
});


export default router;

