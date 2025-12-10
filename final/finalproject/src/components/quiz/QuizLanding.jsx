import React, { useState, useEffect } from 'react';
import { FaCrown, FaGamepad, FaPenNib, FaChartBar } from "react-icons/fa6";
import { quizApi } from './api/quizApi';
import { useOutletContext, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { loginIdState } from '../../utils/jotai';
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';
import "./QuizLanding.css"

//퀴즈 모달
import QuizGameModal from './QuizGameModal';
import QuizCreateModal from './QuizCreateModal';

export default function QuizLanding () {
    
    //URL에서 ID 직접 가져오기
    const { contentsId } = useParams();
    console.log("QuizLanding contentsId:", contentsId);
    
    //통합 state
    const loginId = useAtomValue(loginIdState);

    //모달 상태 관리
    const [showGameModal, setShowGameModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    //랭킹 데이터 관리
    const [topRanker, setTopRanker] = useState(null);
    const [myStats, setMyStats] = useState({ totalSolved: 0, bestScore: 0, rankPercent: 0 });

    useEffect(() => {
        if (!contentsId) return;

        const fetchRanking = async () => {
            try {
                //axios 연결
                const rankingList = await quizApi.getRanking(contentsId);

                if (rankingList && rankingList.length > 0) {
                    const numberOne = rankingList[0]; 
                    setTopRanker({
                        nickname: numberOne.memberNickname || "익명의 고수", 
                        score: numberOne.totalScore || 0,
                        avatar: numberOne.memberImg || "https://via.placeholder.com/100"
                    });
                } else {
                    // 데이터가 비어있으면 초기화 (다른 영화 갔다가 돌아올 때 대비)
                    setTopRanker(null);
                }
            } catch (error) {
                console.error("랭킹 로딩 실패:", error);
                setTopRanker(null);
            }
        };

        fetchRanking();
    }, [contentsId]);

    const handleRequireLogin = (actionCallback) => {
        //console.log("1. handleRequireLogin 실행됨. 로그인ID:", loginId);
        //로그인 상태
        if (loginId) {
            //console.log("2. 로그인 상태임 -> 콜백 실행");
            actionCallback();
            return;
        }

        //비로그인 상태
        Swal.fire({
            title: '로그인이 필요해요!',
            text: '퀴즈를 풀거나 등록하려면 로그인이 필요해요.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#59cc9d',
            cancelButtonColor: '#fe8563',
            confirmButtonText: '로그인 하러가기',
            cancelButtonText: '구경만 할래요'
        }).then((result) => {
            if (result.isConfirmed) {
                // 확인 누르면 로그인 페이지로 이동
                navigate('/member/login');
            }
            // 취소 누르면 위치 유지
        });
    };

    const handleQuizChallenge = async () => {
        //console.log("3. handleQuizChallenge 진입함");
        try {
            //console.log("4. API 호출 시작. contentsId:", contentsId);
            //서버에 퀴즈 데이터가 있는지 확인
            const quizList = await quizApi.getQuizGame(contentsId);
            //console.log("5. API 응답 받음:", quizList);

            //퀴즈가 하나도 없다면
            if (!quizList || quizList.length === 0) {
                Swal.fire({
                    icon: 'question',
                    title: '등록된 퀴즈가 없어요 텅~',
                    text: '첫 번째 출제자가 되어주시겠어요? ✍️',
                    showCancelButton: true,
                    confirmButtonColor: '#198754', // 초록색 (출제 버튼 색)
                    cancelButtonColor: '#6c757d',  // 회색
                    confirmButtonText: '네, 제가 낼게요!',
                    cancelButtonText: '다음에 할게요'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // 확인 누르면 -> 문제 출제 모달 열기!
                        setShowCreateModal(true);
                    }
                });
                return; // 게임 모달 열지 않고 종료
            }

            //퀴즈가 있다면
            setShowGameModal(true);

        } catch (error) {
            console.error("퀴즈 조회 에러:", error);
            // 에러 상황에서도 알림
            Swal.fire({
                icon: 'error',
                title: '오류 발생',
                text: '퀴즈 정보를 불러오는 중 문제가 발생했습니다.',
                confirmButtonColor: '#fe8563'
            });
        }
    };

return (
        <div className="container p-4 quiz-text-light">
            
            {/* --- 1. 랭킹 섹션 --- */}
            <div className="card border-0 mb-4 quiz-dark-card text-center shadow-sm">
                <div className="card-body py-5">
                    {topRanker ? (
                        <>
                            <div className="mb-3 position-relative d-inline-block">
                                <FaCrown size={40} className="text-warning position-absolute start-50 translate-middle-x rank-crown-pos" />
                                <img 
                                    src={topRanker.avatar} 
                                    alt="Rank 1" 
                                    className="rounded-circle rank-avatar" 
                                />
                            </div>
                            
                            <h3 className="fw-bold mt-2">{topRanker.nickname}</h3>
                            <p className="opacity-75 mb-0">
                                이 영화의 퀴즈 마스터 🏆 <br/>
                                <span className="badge bg-warning text-dark mt-2">
                                     점수 {topRanker.score}점
                                </span>
                            </p>
                        </>
                    ) : (
                        <div className="py-4 opacity-75">
                            <FaCrown className="rank-empty-icon" />
                            <h5>아직 퀴즈 마스터가 없습니다!</h5>
                            <br />
                            <p>첫 번째 주인공이 되어보세요 👑</p>
                        </div>
                    )}
                </div>
            </div>


            {/* --- 2. 버튼 섹션 --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <button 
                        className="btn btn-primary w-100 shadow-sm quiz-btn-custom"
                        onClick={() => handleRequireLogin(handleQuizChallenge)}
                    >
                        <FaGamepad size={32} className="mb-2" />
                        <span className="fs-5 fw-bold">퀴즈 도전하기</span>
                        <br />
                        <small className="opacity-75 mt-1">내 지식을 테스트해보세요!</small>
                    </button>
                </div>

                <div className="col-md-6">
                    <button 
                        className="btn btn-success w-100 shadow-sm quiz-btn-custom"
                        onClick={() => handleRequireLogin(() => setShowCreateModal(true))}
                    >
                        <FaPenNib size={32} className="mb-2" />
                        <span className="fs-5 fw-bold">문제 출제하기</span>
                        <br />
                        <small className="opacity-75 mt-1">직접 문제를 만들어보세요!</small>
                    </button>
                </div>
            </div>


            {/* --- 3. 통계 섹션 --- */}
            <div className="card border-0 shadow-sm quiz-dark-card">
                {/* stats-header-dark 클래스 적용 확인 */}
                <div className="card-header fw-bold border-0 pt-3 stats-header-dark">
                    <FaChartBar className="me-2" />
                    나의 퀴즈 기록
                </div>
                <div className="card-body">
                    <div className="row text-center">
                        <div className="col-4 stats-divider">
                            <h5 className="fw-bold text-primary">{myStats.totalSolved}</h5>
                            <small className="opacity-75">푼 문제 수</small>
                        </div>
                        <div className="col-4 stats-divider">
                            <h5 className="fw-bold text-success">{myStats.bestScore}점</h5>
                            <small className="opacity-75">최고 점수</small>
                        </div>
                        <div className="col-4">
                            <h5 className="fw-bold text-info">Top {myStats.rankPercent}%</h5>
                            <small className="opacity-75">나의 순위</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달들 */}
            {showGameModal && (
                <QuizGameModal 
                    show={showGameModal} 
                    onClose={() => setShowGameModal(false)}
                    contentsId={contentsId}
                />
            )}
            
            {showCreateModal && (
                <QuizCreateModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    contentsId={contentsId}
                />
            )}

        </div>
    );
};

