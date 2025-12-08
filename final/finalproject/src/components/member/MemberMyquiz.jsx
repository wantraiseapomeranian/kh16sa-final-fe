import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";



export default function MemberMypage(){
    const [loginid, setLoginId] = useAtom(loginIdState);
    return(<>
        <h1> {loginid}님의 퀴즈</h1>
        

    </>)
}