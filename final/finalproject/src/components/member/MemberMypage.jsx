import { useAtom } from "jotai"
import { loginIdState, loginLevelState } from "../../utils/jotai"
import { useEffect, useState } from "react";
import axios from "axios";



export default function MemberMypage(){
    //통합 state
    const [loginid, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [memberData, setMemberData] = useState({});

    useEffect(()=>{
            if(loginid === null) return;
            axios.get(`/member/mypage/${loginid}`)
            .then(response=>{
                console.log(response.data);
                setMemberData(response.data);
            })
    },[]);

    return(<>
        <h1> {loginid}님의 정보</h1>
        <table className="table table-hover">
            <tbody>
                <tr>
                    <td>아이디</td>
                    <td>{memberData.memberId}</td>
                </tr>
                <tr>
                    <td>닉네임</td>
                    <td>{memberData.memberNickname}</td>
                </tr>
                <tr>
                    <td>생년월일</td>
                    <td>{memberData.memberBirth}</td>
                </tr>
                <tr>
                    <td>이메일</td>
                    <td>{memberData.memberEmail}</td>
                </tr>
            </tbody>
        </table>
    </>)
}