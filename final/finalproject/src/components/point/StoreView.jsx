import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";
import { toast } from "react-toastify";
import { useSetAtom } from "jotai";
import { pointRefreshAtom } from "../../utils/jotai"; 
import Swal from "sweetalert2"; 
import "./StoreView.css";

function storeGetScore(storeLevel) {
    if (storeLevel === "관리자") return 99;
    if (storeLevel === "우수회원") return 2;
    if (storeLevel === "일반회원") return 1;
    return 0; 
}

export default function StoreView({ loginLevel: storeLoginLevel, refreshPoint: storeRefreshPoint }) {
    const [storeItems, setStoreItems] = useState([]);       
    const [storeMyItems, setStoreMyItems] = useState([]);   
    const [storeWishList, setStoreWishList] = useState([]); 
    const [storeShowAddModal, setStoreShowAddModal] = useState(false); 
    const [storeEditTarget, setStoreEditTarget] = useState(null);      
    const storeSetPointRefresh = useSetAtom(pointRefreshAtom);

    const storeLoadData = useCallback(async () => {
        try {
            const [storeItemsResp, storeMyResp, storeWishResp] = await Promise.all([
                axios.get("/point/main/store"),
                storeLoginLevel ? axios.get("/point/main/store/inventory/my") : Promise.resolve({ data: [] }),
                storeLoginLevel ? axios.get("/point/main/store/wish/check") : Promise.resolve({ data: [] })
            ]);
            setStoreItems(storeItemsResp.data);
            setStoreMyItems(storeMyResp.data);
            setStoreWishList(storeWishResp.data);
        } catch (storeError) { console.error("데이터 로딩 실패", storeError); }
    }, [storeLoginLevel]);

    useEffect(() => { storeLoadData(); }, [storeLoadData]);

    const storeHandleBuy = async (storeItem) => {
        const storeRes = await Swal.fire({ 
            title: '구매 확인', 
            text: `[${storeItem.pointItemName}]을 구매하시겠습니까?`, 
            icon: 'question', 
            showCancelButton: true, 
            confirmButtonColor: '#f1c40f', 
            background: '#1a1a1a', 
            color: '#fff' 
        });
        if (!storeRes.isConfirmed) return;
        try {
            await axios.post("/point/main/store/buy", { buyItemNo: storeItem.pointItemNo });
            toast.success("구매 완료! 🎒");
            storeSetPointRefresh(v => v + 1);
            if (storeRefreshPoint) storeRefreshPoint();
            storeLoadData();
        } catch (storeError) { 
            Swal.fire({ 
                icon: 'error', 
                text: storeError.response?.data || "구매 실패", 
                background: '#1a1a1a', 
                color: '#fff' 
            }); 
        }
    };

    const storeHandleGift = async (storeItem) => {
        const { value: storeTargetId } = await Swal.fire({ 
            title: '아이템 선물', 
            input: 'text', 
            inputLabel: '상대방 ID 입력', 
            showCancelButton: true, 
            confirmButtonColor: '#f1c40f', 
            background: '#1a1a1a', 
            color: '#fff' 
        });
        if (!storeTargetId) return;
        try {
            await axios.post("/point/main/store/gift", { itemNo: storeItem.pointItemNo, targetId: storeTargetId });
            toast.success(`${storeTargetId}님께 선물 완료!`);
            storeSetPointRefresh(v => v + 1);
            storeLoadData();
        } catch (storeError) { toast.error(storeError.response?.data || "실패"); }
    };

    const storeHandleToggleWish = async (storeItemNo) => {
        if (!storeLoginLevel) return toast.warning("로그인이 필요합니다.");
        try {
            await axios.post("/point/main/store/wish/toggle", { itemNo: storeItemNo });
            storeLoadData();
        } catch (storeError) { toast.error("찜하기 실패"); }
    };

    return (
        <div className="storeContainer">
            <div className="storeHeader">
                <h4 className="storeTitle">popcorn 스토어 <span>({storeItems.length})</span></h4>
                {storeLoginLevel === "관리자" && (
                    <button className="storeBtnAdd" onClick={() => setStoreShowAddModal(true)}>+ 상품 등록</button>
                )}
            </div>

            <div className="storeGoodsGrid">
                {storeItems.map((storeItem) => {
                    const storeMyScore = storeGetScore(storeLoginLevel);
                    const storeReqScore = storeGetScore(storeItem.pointItemReqLevel);
                    const storeCanAccess = (storeMyScore >= storeReqScore);
                    const storeIsSoldOut = storeItem.pointItemStock <= 0;

                    const storeIsOwned = storeMyItems.some(i => Number(i.inventoryItemNo) === Number(storeItem.pointItemNo));
                    const storeIsLimitedAndOwned = storeIsOwned && storeItem.pointItemIsLimitedPurchase === 1;

                    return (
                        <div className={`storeGoodsCard ${storeIsSoldOut ? "disabled" : ""}`} key={storeItem.pointItemNo}>
                            <div className="storeGoodsImgBox">
                                <img src={storeItem.pointItemSrc || "/default.png"} alt="item" />
                                
                                <button className="storeWishOverlay" onClick={() => storeHandleToggleWish(storeItem.pointItemNo)}>
                                    {storeWishList.includes(storeItem.pointItemNo) ? "❤️" : "🤍"}
                                </button>

                                <div className="storeBadgeOverlay">
                                    {storeIsOwned && <span className="storeBadgeOwn">보유중</span>}
                                    {storeIsSoldOut && <span className="storeBadgeSoldout">품절</span>}
                                </div>
                            </div>
                            <div className="storeGoodsContent">
                                <h5 className="storeItemName">{storeItem.pointItemName}</h5>
                                <div className="storeItemMetaRow">
                                    <span className="storeBadgeLv">Lv.{storeItem.pointItemReqLevel}</span>
                                    {storeItem.pointItemDailyLimit > 0 && (
                                        <span className="storeBadgeDaily">일일 {storeItem.pointItemDailyLimit}개</span>
                                    )}
                                </div>
                                <div className="storeItemBottomGroup">
                                    <div className="storeItemPrice">{storeItem.pointItemPrice.toLocaleString()} P</div>
                                    <div className="storeItemButtons">
                                        {storeCanAccess ? (
                                            <>
                                                <button 
                                                    className={`storeBtnBuy ${storeIsLimitedAndOwned ? "owned" : ""}`} 
                                                    onClick={() => storeHandleBuy(storeItem)} 
                                                    disabled={storeIsSoldOut || storeIsLimitedAndOwned}
                                                >
                                                    {storeIsLimitedAndOwned ? "보유함" : "구매"}
                                                </button>
                                                <button className="storeBtnGift" onClick={() => storeHandleGift(storeItem)} disabled={storeIsSoldOut}>선물</button>
                                            </>
                                        ) : ( 
                                            <button className="storeBtnLocked" disabled>🔒 등급 부족</button> 
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {storeShowAddModal && <ProductAdd closeModal={() => setStoreShowAddModal(false)} reload={storeLoadData} />}
            {storeEditTarget && <ProductEdit target={storeEditTarget} closeModal={() => setStoreEditTarget(null)} reload={storeLoadData} />}
        </div>
    );
}