import { useAtom } from "jotai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useCallback, useEffect, useMemo, useState } from "react"
import { accessTokenState, loginIdState, refreshTokenState } from "../../utils/jotai";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./review.css";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const INITIAL_DETAIL = {
    contentsId: null, contentsTitle: "", contentsType: "",
    contentsOverview: "", contentsPosterPath: "", contentsBackdropPath: "",
    contentsVoteAverage: 0, contentsRuntime: 0, contentsReleaseDate: "",
    contentsDirector: "", contentsMainCast: "", genreNames: [],
};


export default function ReviewDetail() {
    const { contentsId, reviewNo } = useParams();


    //state
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);


    const [review, setReview] = useState({
        reviewRating: 0,
        reviewSpoiler: "N",
        reviewText: "",
        reviewLike: 0,
        reviewRealiability: 0,
        reviewPrice: "",
        reviewWtime: "",
        reviewEtime: ""
    });

    const [reviewClass, setReviewClass] = useState("");
    //영화 정보 state
    const [contentsDetail, setContentsDetail] = useState(INITIAL_DETAIL);
    //영화 로딩 상태 state
    const [isLoading, setIsLoading] = useState(false);
    //상태 메세지 state
    const [statusMessage, setStatusMessage] = useState("");
    //화면 조건 렌더링 + 리뷰 state
    const [isUpdateReview, setIsUpdateReview] = useState(() => !reviewNo);
    //리뷰 존재 여부 state
    const [userReviewExists, setUserReviewExists] = useState(false);

    const [allReviews, setAllReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);

    const reviewData = {
        ...review,
        reviewContents: contentsId,
        reviewWriter: loginId
    };


    //effect
    useEffect(() => {
        if (isLoading === true) {
            setStatusMessage("로딩중...")
        }
    });

    useEffect(() => {
        if (!contentsId) {
            setStatusMessage("영화 정보를 찾을 수 없습니다.")
            return;
        }
        loadContentData();
    }, [accessToken, contentsId])


    useEffect(() => {
        const fetchReview = async () => {
            try {
                setIsLoading(true);
                const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
                const { data } = await axios.get(`/review/${contentsId}/${reviewNo}`, { headers });
                if (data) {
                    setReview({
                        reviewRating: data.reviewRating,
                        reviewSpoiler: data.reviewSpoiler,
                        reviewText: data.reviewText,
                        reviewLike: data.reviewLike,
                        reviewRealiability: data.reviewRealiability,
                        reviewPrice: data.reviewPrice,
                        reviewWtime: data.reviewWtime,
                        reviewEtime: data.reviewEtime
                    });
                    setRating(data.reviewRating);
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    setStatusMessage("로그인이 필요합니다.");
                }
                if (error.response?.status === 404) {
                    setStatusMessage("존재하지 않는 리뷰입니다.");
                }
                if (error.response?.status === 500) {
                    setStatusMessage("리뷰를 불러오는데 실패했습니다.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchReview();
    }, [reviewNo, contentsId, accessToken]);


    const loadContentData = useCallback(async () => {
        if (!contentsId) return;

        try {
            setIsLoading(true);
            setStatusMessage("영화 정보를 불러오는 중...");

            const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
            const { data } = await axios.get(`/api/tmdb/contents/detail/${contentsId}`, { headers });

            setContentsDetail(data);
            setStatusMessage("");
        } catch (error) {
            console.error(error);
            setStatusMessage("영화 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [contentsId, accessToken]);


    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    //별점 기능 구현
    const [rating, setRating] = useState(0);
    const [ratingAlert, setRatingAlert] = useState(false);

    const handleStarClick = (num) => {
        setRating(num);  // 클릭한 별 번호로 rating 설정
        setReview(prev => ({
            ...prev,
            reviewRating: num
        }));
    };

    //Memo
    //장르 목록을 react 엘리먼트로 변환하는 함수
    const renderGenres = useMemo(() => {
        if (!contentsDetail.genreNames || contentsDetail.genreNames.length === 0) {
            return <span className="text-muted">장르 정보 없음</span>;
        }
        return contentsDetail.genreNames.map((name, index) => (
            <span key={index} className="text-muted me-1">
                {name}
            </span>
        ));
    }, [contentsDetail.genreNames]);

    //방영일 날짜 형식 변경
    const formattedDate = useMemo(() => {
        const formattedDate = contentsDetail.contentsReleaseDate.split(" ")[0];
        return formattedDate;
    }, [contentsDetail.contentsReleaseDate]);




    //render
    return (<>
        <div className="container">
            <div className="row mb-3">
                <div className="col  d-flex justify-content-center">
                    {/* 본인이면  mainTitleB 버튼 나와서 수정, 삭제  모달*/}
                    <h5 className="mainTitle">리뷰</h5>
                </div>
                <div className="col d-flex justify-content-end">
                    <button className="mainTitleB" type="button"><BsThreeDotsVertical /></button>
                </div>
                <div>
                    <span>{reviewData.reviewWriter}</span>
                    <span>몇일 전!!</span>
                </div>
                <div>{contentsDetail.contentsTitle}</div>
                <div>{review.reviewRating}별점</div>
                <div>{review.reviewPrice}가격 없으면 공백</div>
                <hr />
                <div>{review.reviewText}</div>
                <div className="col">
                    <span>{review.reviewLike}좋아요</span>
                </div>
            </div>
        </div>
    </>)
}