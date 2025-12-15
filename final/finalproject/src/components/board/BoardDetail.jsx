import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";



export default function BoardDetail(){
    const navigate = useNavigate();
    //state
    const [board, setBoard] = useState({});
    const {boardNo} = useParams();
    const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

    // effect
    useEffect(()=>{
        console.log(boardNo);
        loadData();
    },[])

    // callback
    const loadData = useCallback(async()=>{
        const {data} = await axios.get(`/board/${boardNo}`);
        setBoard(data);
    },[])

    const deleteBoard = useCallback(async()=>{
        const choice = window.confirm("게시글을 삭제하시겠습니까?");
        if(choice === false) return;
        try {
            await axios.delete(`/board/${boardNo}`);
            console.log("삭제 완료");
            toast.success("게시글이 삭제되었습니다");
            navigate("/board/list");
        }
        catch(err){
            toast.error("삭제 실패")
            return;
        }
    },[])

    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    //rendar
    return (<>
        <div className="row">
            <div className="col-9 text-center">
                <h1>{board.boardTitle} </h1>
            </div>
            <div className="col-3">
                board.boardContentsId
                <img
                    src={getPosterUrl("#")}
                    className="card-img-top" alt={board.boardTitle}
                    style={{ height: "300px", objectFit: "cover" }}
                />
            </div>
        </div>
        <div className="row">
            <div className="col-3">
                {board.boardWriter}
            </div>
            <div className="col-6">
                {board.boardWtime}
            </div>
        </div>
        <hr/>



        {board.boardText}<br/>
        <hr/>
        <div className="row mt-2">
            <div className="col">
                <Link className="btn btn-secondary me-2" to="/board/list">전체목록</Link>
                <Link className="btn btn-secondary me-2" to={`/board/edit/${board.boardNo}`}>수정</Link>
                <button type="button" className="btn btn-secondary" onClick={deleteBoard}>삭제</button>
            </div>
        </div>
    </>)


}