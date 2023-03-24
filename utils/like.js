import 'dotenv/config';
import axios from 'axios';
import { login } from './login.js';
import { getUserProfiles } from './profiles.js';
import { delayFn } from "./common.js";


let pk = process.env.PK;
let publicationId = process.env.PUBLICATIONID;

let like = async(userProfile, loginResult, publicationId) => {
    let url = "https://api.lens.dev/";
    let config = {
        headers: {
            "referer": "https://claim.lens.xyz/",
            "origin": "https://claim.lens.xyz",
            "content-type": "application/json",
            "x-access-token": `Bearer ${loginResult.accessToken}`,
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        }
    };
    let payload = {
        "operationName": "AddReaction",
        "variables": {
            "request": {
                "profileId": `${userProfile.id}`,
                "reaction": "UPVOTE",
                "publicationId": `${publicationId}`
            }
        },
        "query": "mutation AddReaction($request: ReactionRequest!) {\n  addReaction(request: $request)\n}"
    };
    try{
        let res = await axios.post(url, payload, config);
        if(res.data.data.addReaction == null){
            console.log(`${userProfile.handle}---点赞成功`);
        }
    }catch(err){
        console.log(`${userProfile.handle}---点赞失败: ${err}`);
        return false
    };
}

const pub_list = publicationId.split(",");

async function start(pk, delay) {
    try {
        let loginResult = await login(pk);
        await delayFn(delay); // 延迟执行
        let userProfile = await getUserProfiles(pk);
        await delayFn(delay); // 延迟执行
        for (let i = 0; i < pub_list.length; i++) {
            await like(userProfile, loginResult, pub_list[i]);
            await delayFn(delay); // 延迟执行
        }
        await delayFn(delay); // 延迟执行
    } catch (error) {
        console.error(`task failed: ${error}`);
    }
}

const pk_list = pk.split(",");

for (let i = 0; i < pk_list.length; i++) {
    const delay = Math.floor(Math.random() * 10 + 1) * 1000; // 生成1-10的随机数
    start(pk_list[i], delay)
        .then(() => console.log(`${new Date().toISOString()} task ${i + 1} completed`))
        .catch(error => console.error(`${new Date().toISOString()} task ${i + 1} failed: ${error}`));
}