import express, { json, urlencoded } from "express";
import { TwitterApi } from 'twitter-api-v2';
import { Client } from "twitter-api-sdk";

const router = express.Router();

//Fetching all asset owners twitter profile by uid
router.post("/", async function (req, res, next) {
    const uid = req.body.uid;
    const appClient = new Client(process.env.BEARER_TOKEN);
    try {
        const response = await appClient.users.findUserById(uid, {
            "user.fields": [
                "profile_image_url",
                "username",
                "verified"
            ]
        });
        console.log("response", JSON.stringify(response, null, 2));

        res.send(response);

    } catch (e) {
        console.log(e.message);
    }
});


//Sending tweet about newly created asset
router.post("/tweet", async function (req, res, next) {

    const client = new TwitterApi({
        appKey: process.env.APP_KEY,
        appSecret: process.env.APP_SECRET,
        accessToken: req.body.accessToken,
        accessSecret: req.body.accessSecret,
    });


    const text = req.body.text

    try {
        const response = await client.v1.tweet(text);
        console.log("response", JSON.stringify(response, null, 2));
        res.send(response);
    } catch (error) {
        console.log("tweets error", error);
    }


});


export default router;