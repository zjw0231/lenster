import 'dotenv/config';
import axios from 'axios';
import {login} from './login.js';
import {v4 as uuidv4} from 'uuid';
import {getUserProfiles} from './profiles.js';
import {delayFn, getRandomElement} from './common.js'

let pk = process.env.PK;
let context = process.env.CONTEXT;
let cont_list = ["st tried a new recipe and it turned out amazing! #cooking #foodie", "Can't wait for summer vacation! #beachtime #vacay", "Just finished my morning workout, feeling energized! #fitness #motivation", "Finally got around to organizing my closet, feels so satisfying! #organization #decluttering", "Watching the sunset with my favorite person in the world. #love #romance", "Just had the best sushi ever at this new spot in town. #foodie #sushi", "It's raining outside and I'm curled up with a good book. #cozy #reading", "My team won the game, so proud of them! #sports #teamwork", "Just booked my tickets for my next adventure, can't wait! #travel #adventure", "Tried a new coffee shop today and the latte was amazing. #coffee #caffeinefix", "Finally finished that project I've been working on for weeks. #accomplishment #work", "Spending the day with my family, so grateful for them. #familytime #love", "Can't wait for the weekend, need a break from work. #weekendvibes #relaxation", "Just watched a documentary that completely changed my perspective. #education #learning", "It's a beautiful day outside, time for a picnic! #outdoors #nature", "Just tried a new yoga class and I feel so zen. #yoga #wellness", "Celebrating my friend's birthday tonight, can't wait to party! #celebration #friends", "Had a great interview today, fingers crossed for good news. #jobsearch #career", "Just finished binge-watching my favorite show, now I don't know what to do with my life. #Netflix #entertainment", "Can't believe how fast time flies, it's already March! #timeflies #calendar", "Just had the best gelato of my life, can't stop thinking about it. #dessert #yum", "Going to see a movie tonight, any recommendations? #movies #entertainment", "Just got a promotion at work, feeling proud and grateful. #success #career", "Can't wait to see my favorite band live next month. #music #concert", "Just had a long talk with my best friend, feeling so grateful for their support. #friendship #gratitude", "Watching the stars with my significant other, feeling so lucky to have them in my life. #love #romance", "Finally got a good night's sleep, feeling refreshed! #sleep #rest", "Trying to learn a new language, any tips? #languagelearning #education", "Just got a new haircut, feeling like a new person! #hairstyle #selfcare", "It's a lazy Sunday and I'm spending it in bed. #relaxation #weekendvibes", "Can't believe I just ran a marathon, feeling so proud of myself! #fitness #achievement", "Just had a productive day at work, time to unwind. #worklifebalance #relaxation", "Can't wait to try this new restaurant everyone's been raving about. #foodie #dining", "Just finished a challenging puzzle, feeling accomplished! #puzzles #challenge", "Finally finished reading that book I've been meaning to get to. #reading #books", "Just went on a hike and the views were breathtaking. #nature"];

const context_list = context.split(",");
// console.log("已加载词库,",context_list);
// console.log("已加载词库2,",cont_list);

let post1 = async (userProfile, context) => {
    let url = "https://metadata.lenster.xyz/";
    let config = {
        headers: {
            "referer": "https://claim.lens.xyz/",
            "origin": "https://claim.lens.xyz",
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        }
    };
    let payload = {
        "version": "2.0.0",
        "metadata_id": `${uuidv4()}`,
        "description": `${context}`,
        "content": `${context}`,
        "external_url": `https://lenster.xyz/u/${userProfile.handle}`,
        "image": null,
        "imageMimeType": "image/svg+xml",
        "name": `Post by @${userProfile.handle}`,
        "tags": [],
        "animation_url": null,
        "mainContentFocus": "TEXT_ONLY",
        "contentWarning": null,
        "attributes": [{
            "traitType": "type",
            "displayType": "string",
            "value": "text_only"
        }],
        "media": [],
        "locale": "zh-CN",
        "appId": "Lenster"
    };
    try {
        let res = await axios.post(url, payload, config);
        // console.log(res.data.id);
        return res.data.id;
    } catch (err) {
        console.log(`${userProfile.handle}---post1失败: ${err}`);
        return false
    }
    ;
}

let post2 = async (arId, userProfile, loginResult) => {
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
        "operationName": "CreatePostViaDispatcher",
        "variables": {
            "request": {
                "profileId": `${userProfile.id}`,
                "contentURI": `https://arweave.net/${arId}`,
                "collectModule": {
                    "revertCollectModule": true
                },
                "referenceModule": {
                    "degreesOfSeparationReferenceModule": {
                        "commentsRestricted": true,
                        "mirrorsRestricted": true,
                        "degreesOfSeparation": 2
                    }
                }
            }
        },
        "query": "mutation CreatePostViaDispatcher($request: CreatePublicPostRequest!) {\n  createPostViaDispatcher(request: $request) {\n    ...RelayerResultFields\n    __typename\n  }\n}\n\nfragment RelayerResultFields on RelayResult {\n  ... on RelayerResult {\n    txHash\n    txId\n    __typename\n  }\n  ... on RelayError {\n    reason\n    __typename\n  }\n  __typename\n}"
    };
    try {
        let res = await axios.post(url, payload, config);
        // console.log(res.data.data.createPostViaDispatcher.txId);
        if (res.data.data.createPostViaDispatcher.txId != "") {
            console.log(`${userProfile.handle}---发帖成功`);
        }
    } catch (err) {
        console.log(`${userProfile.handle}---post2失败: ${err}`);
        return false
    }
    ;
}


// let start = async(pk1) => {
//     let loginResult = await login(pk1);
//     let userProfile =  await getUserProfiles(pk1);
//     let arId = await post1(userProfile);
//     await post2(arId, userProfile, loginResult);
//
// }

//
// const pk_list = pk.split(",");
// for (let i = 0; i < pk_list.length; i++) {
//     start(pk_list[i]);
// }


async function start(pk, delay) {
    try {
        let loginResult = await login(pk);
        await delayFn(delay); // 延迟执行
        let userProfile = await getUserProfiles(pk);
        await delayFn(delay); // 延迟执行
        let context1 = getRandomElement(cont_list);
        console.log("发帖内容：", context1);
        let arId = await post1(userProfile, context1);
        await delayFn(delay); // 延迟执行
        await post2(arId, userProfile, loginResult);
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