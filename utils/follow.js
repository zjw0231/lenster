import 'dotenv/config';
import axios from 'axios';
import { login } from './login.js';
import { getUserProfiles } from './profiles.js';


let pk = process.env.PK;
let handle = process.env.HANDLE;

let profile = async(userProfile, loginResult) =>{
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
        "operationName": "Profile",
        "variables": {
            "request": {
                "handle": `${handle}`
            },
            "who": `${userProfile.id}`
        },
        "query": "query Profile($request: SingleProfileQueryRequest!, $who: ProfileId) {\n  profile(request: $request) {\n    id\n    handle\n    ownedBy\n    name\n    bio\n    metadata\n    followNftAddress\n    isFollowedByMe\n    isFollowing(who: $who)\n    attributes {\n      key\n      value\n      __typename\n    }\n    dispatcher {\n      canUseRelay\n      __typename\n    }\n    onChainIdentity {\n      proofOfHumanity\n      sybilDotOrg {\n        verified\n        source {\n          twitter {\n            handle\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      ens {\n        name\n        __typename\n      }\n      worldcoin {\n        isHuman\n        __typename\n      }\n      __typename\n    }\n    stats {\n      totalFollowers\n      totalFollowing\n      totalPosts\n      totalComments\n      totalMirrors\n      __typename\n    }\n    picture {\n      ... on MediaSet {\n        original {\n          url\n          __typename\n        }\n        __typename\n      }\n      ... on NftImage {\n        uri\n        __typename\n      }\n      __typename\n    }\n    coverPicture {\n      ... on MediaSet {\n        original {\n          url\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    followModule {\n      __typename\n    }\n    __typename\n  }\n}"
    };
    try{
        let res = await axios.post(url, payload, config);
        return {
            "id": res.data.data.profile.id,
            "isFollowedByMe": res.data.data.profile.isFollowedByMe,
            "isFollowing": res.data.data.profile.isFollowing
        }
    }catch(err){
        console.log(`${userProfile.handle}---获取用户id失败: ${err}`);
        return false
    };
}

let follow = async(result, userProfile, loginResult) => {
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
        "operationName": "ProxyAction",
        "variables": {
            "request": {
                "follow": {
                    "freeFollow": {
                        "profileId": `${result.id}`
                    }
                }
            }
        },
        "query": "mutation ProxyAction($request: ProxyActionRequest!) {\n  proxyAction(request: $request)\n}"
    };
    try{
        let res = await axios.post(url, payload, config);
        if(res.data.data.proxyAction != ""){
            console.log(`${userProfile.handle}---关注成功---${res.data.data.proxyAction}`);
        }
    }catch(err){
        console.log(`${userProfile.handle}---关注失败: ${err}`);
        return false
    };
}

// let start = async(pk1) => {
//     let loginResult = await login(pk1);
//     let userProfile =  await getUserProfiles(pk1);
//     let result = await profile(userProfile, loginResult);
//     if(result.isFollowedByMe == true){
//         console.log(`已经关注: ${handle} 用户, 无法重复关注`);
//     }else{
//         await follow(result, userProfile, loginResult);
//     }
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
        let result = await profile(userProfile, loginResult);
        await delayFn(delay); // 延迟执行
        if (result.isFollowedByMe == true) {
            console.log(`${new Date().toISOString()} 已经关注: ${handle} 用户, 无法重复关注`);
        } else {
            await follow(result, userProfile, loginResult);
        }
    } catch (error) {
        console.error(`task failed: ${error}`);
    }
}

function delayFn(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay + Math.floor(Math.random() * 5 ) * 900));
}



const pk_list = pk.split(",");
for (let i = 0; i < pk_list.length; i++) {
    const delay = Math.floor(Math.random() * 10 + 1) * 1000; // 生成1-10的随机数
    start(pk_list[i], delay)
        .then(() => console.log(`${new Date().toISOString()} task ${i+1} completed`))
        .catch(error => console.error(`${new Date().toISOString()} task ${i+1} failed: ${error}`));
}



