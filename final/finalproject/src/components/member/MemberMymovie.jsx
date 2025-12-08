import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";



export default function MemberMymovie(){
    const [loginid, setLoginId] = useAtom(loginIdState);
    return(<>
        <h1> {loginid}님의 영화</h1>
        

    </>)
}