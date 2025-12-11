import { useAtom } from "jotai";
import { loginIdState, loginNicknameState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";



export default function MemberMypage(){
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    
    //state
    const [answerQuizList, setAnswerQuizList] = useState([]);
    const [addQuizList, setAddQuizList] = useState([]);

    //callback 
    const loadData = useCallback(async()=>{
        const answerList = await axios.get(`/member/myanswerquiz/${loginId}`);
        setAnswerQuizList(answerList.data);
        const addList = await axios.get(`/member/myaddquiz/${loginId}`);
        setAddQuizList(addList.data);
    },[loginId]);



    useEffect(()=>{
        loadData();
    },[loadData]);

    
    return(<>
        <h1 className="text-center"> {loginNickname}님의 퀴즈</h1>
        
        
        <div className="row mt-2">
            <div className="col text-center">
                <label className="fs-4 mb-2">내가 푼 퀴즈</label>
                <table className="table table-hover table-striped">
                    <thead>
                        <tr>
                            <td>문제</td>
                            <td>정답여부</td>
                        </tr>
                    </thead>
                       {answerQuizList.map((answerQuiz)=>(
                        <tbody key={answerQuiz.quizId}>
                            <tr>
                                <td>{answerQuiz.quizQuestion}</td>
                                <td>{answerQuiz.quizLogIsCorrect}</td>
                            </tr>
                        </tbody>
                      ))}
             </table>
            </div>
        </div>


        <div className="row mt-2">
            <div className="col text-center">
                <label className="fs-4 mb-2">내가 등록한 퀴즈</label>
                <table className="table table-hover table-striped">
                    <thead>
                        <tr>
                            <td>문제</td>
                            <td>타입</td>
                            <td>1</td>
                            <td>2</td>
                            <td>3</td>
                            <td>4</td>
                            <td>정답</td>
                        </tr>
                    </thead>
                      {addQuizList.map((addQuiz)=>(
                        <tbody key={addQuiz.quizId}>
                            <tr>
                                <td>{addQuiz.quizQuestion}</td>
                                <td>{addQuiz.quizType}</td>
                                <td>{addQuiz.quizOption1}</td>
                                <td>{addQuiz.quizOption2}</td>
                                <td>{addQuiz.quizOption3}</td>
                                <td>{addQuiz.quizOption4}</td>
                                <td>{addQuiz.quizAnswer}</td>
                            </tr>
                        </tbody>
                      ))}
             </table>
            </div>
        </div>



    </>)
}