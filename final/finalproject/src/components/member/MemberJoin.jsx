import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"


export default function member(){
    //도구
    const navigate = useNavigate();

    //state
    const [member, setMember] = useState({
        memberId : "", memberPw : "", memberNickname : "",
        memberEmail : "", memberBirth : "", memberContact : "",
        memberPost : "", memberAddress1 : "", memberAddress2 : ""
    });
    const [memberClass, setMemberClass] = useState({
        memberId : "", memberPw : "", memberNickname : "",
        memberEmail : "", memberBirth : "", memberContact : "",
        memberPost : "", memberAddress1 : "", memberAddress2 : ""
    });

    // 출력할 피드백
    const [memberIdFeedback, setmemberIdFeedback] = useState("");
    const [memberPwFeedback, setmemberPwFeedback] = useState("");
    const [memberNicknameFeedback, setmemberNicknameFeedback] = useState("");
    const [memberEmailFeedback, setmemberEmailFeedback] = useState("");



    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev=>({...prev, [name]:value}))
    },[])

    const changeDateValue = useCallback((date)=>{
        // → 별도의 포맷 전환 절차가 필요
        const replacement = format(date,"yyyy-MM-dd");
        setAccount(prev=>({...prev, accountBirth : replacement}));
    },[]);

    //각 항목 검사 : feedback
    // 아이디 (형식검사 + 중복검사)
    const checkMemberId = useCallback(async(e)=>{
        const regex = /^[a-z][a-z0-9]{4,19}$/;
        const valid = regex.test(member.memberId);
        if(valid){ // 형식 통과
            const {data} = await axios.get(`/member/memberId/${member.memberId}`)
            if(data===true){ // 중복X
                setMemberClass(prev=>({...prev,memberId : "is-valid"}));
            }
            else{ // 사용중 (ID중복)
                setMemberClass(prev=>({...prev, memberId : "is-invalid"}));
                setmemberIdFeedback("이미 사용중인 아이디입니다");
            }
        }
        else { // 형식 오류
            setMemberClass(prev=>({...prev, memberId : "is-invalid"}));
            setmemberIdFeedback("영문 소문자로 시작하며, 숫자를 포함한 5-20자로 작성하세요");
        }
        
        //필수항목
        if(member.memberId.length===0){
            setMemberClass(prev=>({...prev, memberId : "is-invalid"}));
            setmemberIdFeedback("아이디는 필수 항목입니다");
        }
    },[member,memberClass])

    // 비밀번호
    
    // 닉네임 (형식검사 + 중복검사)
    const checkMemberNickname = useCallback(async(e)=>{
        const regex = /^[가-힣0-9]{2,10}$/;
        const valid = regex.test(member.memberNickname);
        if(valid){ // 형식 통과
            const {data} = await axios.get(`/member/memberNickname/${member.memberNickname}`)
            if(data===true){ // 중복X
                setMemberClass(prev=>({...prev,memberNickname : "is-valid"}));
            }
            else{ // 사용중 (ID중복)
                setMemberClass(prev=>({...prev, memberNickname : "is-invalid"}));
                setmemberNicknameFeedback("이미 사용중인 닉네임입니다");
            }
        }
        else { // 형식 오류
            setMemberClass(prev=>({...prev, memberNickname : "is-invalid"}));
            setmemberNicknameFeedback("닉네임은 한글/숫자를 활용한 2~10글자입니다");
        }
        
        //필수항목
        if(member.memberNickname.length===0){
            setMemberClass(prev=>({...prev, memberNickname : "is-invalid"}));
            setmemberNicknameFeedback("닉네임은 필수 항목입니다");
        }
    },[member,memberClass])



    //memo
    // 모든 항목이 유효한지 검사(선택항목은 is-invalid가 아니어야함)
    const memberValid = useMemo(()=>{
        //필수항목
        if(memberClass.memberId !== "is-valid") return false;
        if(memberClass.memberPw !== "is-valid") return false;
        if(memberClass.memberNickname !== "is-valid") return false;
        if(memberClass.memberEmail !== "is-valid") return false;
        //선택항목
        if(memberClass.memberBirth==="is-invalid") return false;
        if(memberClass.memberContact==="is-invalid") return false;
        if(memberClass.memberPost==="is-invalid") return false;
        if(memberClass.memberAddress1==="is-invalid") return false;
        if(memberClass.memberAddress2==="is-invalid") return false;
        return true;
    },[memberClass])

    //callback
    //최종 가입
    const sendData = useCallback(async()=>{
        if(memberValid === false) return ;
        const {data} = await axios.post("/member/",member)
        
        //navigate("/"); // 메인페이지
    },[member,memberValid])

    //render
    return (<>
        <h2>회원가입</h2>

        {/* 아이디 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">아이디</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberId}`} 
                            name="memberId" value={member.memberId}
                            onChange={changeStrValue}
                            onBlur={checkMemberId}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">{memberIdFeedback}</div>
            </div>
        </div>

        {/* 비밀번호 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberPw}`} 
                            name="memberPw" value={member.memberPw}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">{memberPwFeedback}</div>
            </div>
        </div>
        
        {/* 닉네임 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">닉네임</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberNickname}`} 
                            name="memberNickname" value={member.memberNickname}
                            onChange={changeStrValue}
                            onBlur={checkMemberNickname}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">{memberNicknameFeedback}</div>
            </div>
        </div>
        
        {/* 이메일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">이메일</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberEmail}`} 
                            name="memberEmail" value={member.memberEmail}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">{memberEmailFeedback}</div>
            </div>
        </div>

        {/* 생년월일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">생년월일</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberBirth}`} 
                            name="memberBirth" value={member.memberBirth}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>

        {/* 연락처 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">연락처</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberContact}`} 
                            name="memberContact" value={member.memberContact}
                            onChange={changeDateValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        
        {/* 주소 (Post, Address1, Address2) */}
        {/* ---------------------------- */}
        
        {/* 가입버튼  */}
        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-success w-100"
                            disabled={memberValid === false}
                            onClick = {sendData}
                            >
                <span>가입</span>
                </button>
            </div>
        </div>


    </>)
}