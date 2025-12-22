import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; 
import "./InventoryView.css";

export default function InventoryView({ ivRefreshPoint }) {
    const [ivItems, setIvItems] = useState([]);

    // [1] 인벤토리 목록 로드
    const ivLoadItems = useCallback(async () => {
        try {
            const ivResp = await axios.get("/point/main/store/inventory/my");
            setIvItems(ivResp.data);
        } catch (ivError) { 
            console.error("인벤토리 로드 실패:", ivError); 
        }
    }, []);

    useEffect(() => { 
        ivLoadItems(); 
    }, [ivLoadItems]);

    // [2] 사용 및 장착 핸들러
    const ivHandleUse = async (ivTargetItem) => {
        const ivTargetNo = ivTargetItem.inventoryNo; 
        const ivType = ivTargetItem.pointItemType;
        let ivExtraValue = null;

        // 아이템 유형별 전처리
        if (ivType === "CHANGE_NICK") {
            const { value: ivNickText } = await Swal.fire({
                title: '닉네임 변경',
                input: 'text',
                inputLabel: '새로운 닉네임을 입력해주세요 (2~10자)',
                inputPlaceholder: '변경할 닉네임 입력',
                showCancelButton: true,
                confirmButtonText: '변경하기',
                cancelButtonText: '취소',
                background: '#1a1a1a', color: '#fff',
                inputValidator: (value) => {
                    if (!value || value.length < 2 || value.length > 10) {
                        return '2~10자 사이의 닉네임을 입력해야 합니다!';
                    }
                }
            });
            if (!ivNickText) return;
            ivExtraValue = ivNickText;
        } 
        else if (ivType === "HEART_RECHARGE") {
            const ivHeartConfirm = await Swal.fire({
                title: '하트 충전',
                text: `[${ivTargetItem.pointItemName}]을 사용하여 하트 5개를 충전하시겠습니까?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '충전하기',
                cancelButtonText: '취소',
                background: '#1a1a1a', color: '#fff'
            });
            if (!ivHeartConfirm.isConfirmed) return;
        }
        else if (["DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME"].includes(ivType)) { 
            if(ivTargetItem.inventoryEquipped === 'Y') {
                toast.info("이미 착용 중인 아이템입니다.");
                return;
            }
            const ivEquipConfirm = await Swal.fire({
                title: '스타일 적용',
                text: `[${ivTargetItem.pointItemName}] 아이템을 장착하시겠습니까?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '장착',
                cancelButtonText: '취소',
                background: '#1a1a1a', color: '#fff'
            });
            if (!ivEquipConfirm.isConfirmed) return;
        }
        else if (ivType === "RANDOM_ICON") {
            const ivDrawConfirm = await Swal.fire({
                title: '아이콘 뽑기',
                text: "🎲 아이콘 뽑기 티켓을 사용하시겠습니까?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: '뽑기 시작!',
                cancelButtonText: '나중에',
                background: '#1a1a1a', color: '#fff'
            });
            if (!ivDrawConfirm.isConfirmed) return;

            try {
                const ivDrawResp = await axios.post("/point/icon/draw", { inventoryNo: ivTargetNo });
                const ivResultIcon = ivDrawResp.data; 
                
                await Swal.fire({
                    title: `🎉 ${ivResultIcon.iconRarity} 등급 획득!`,
                    text: `[${ivResultIcon.iconName}] 아이콘을 얻었습니다.`,
                    imageUrl: ivResultIcon.iconSrc,
                    imageWidth: 100,
                    imageHeight: 100,
                    imageAlt: 'icon',
                    confirmButtonText: '확인',
                    background: '#1a1a1a', color: '#fff',
                    backdrop: `rgba(0,0,123,0.4) url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXpueG94bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ42Mg6pbMubM4/giphy.gif") center center no-repeat`
                });
                
                ivLoadItems();
                if (ivRefreshPoint) ivRefreshPoint();
                return;
            } catch (drawError) { 
                toast.error("뽑기 실패: " + (drawError.response?.data?.message || "오류 발생")); 
                return;
            }
        }
        else {
            const ivBasicConfirm = await Swal.fire({
                title: '아이템 사용',
                text: `[${ivTargetItem.pointItemName}]을(를) 사용하시겠습니까?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '사용',
                cancelButtonText: '취소',
                background: '#1a1a1a', color: '#fff'
            });
            if (!ivBasicConfirm.isConfirmed) return;
        }

        // 실제 서버 통신
        try {
            const ivUseResp = await axios.post("/point/main/store/inventory/use", { 
                inventoryNo: ivTargetNo, 
                extraValue: ivExtraValue 
            });
            
            if (ivUseResp.data === "success") {
                toast.success("처리가 완료되었습니다! ✨");
                ivLoadItems(); 
                if (ivRefreshPoint) ivRefreshPoint(); 
            } else {
                const ivMsg = String(ivUseResp.data).startsWith("fail:") ? ivUseResp.data.substring(5) : ivUseResp.data;
                toast.error(ivMsg);
            }
        } catch (ivUseError) { 
            toast.error("처리 중 오류가 발생했습니다."); 
        }
    };

    // [3] 장착 해제 핸들러
    const ivHandleUnequip = async (ivTargetItem) => {
        const ivUnequipConfirm = await Swal.fire({
            title: '장착 해제',
            text: `[${ivTargetItem.pointItemName}] 장착을 해제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '해제',
            cancelButtonText: '취소',
            background: '#1a1a1a', color: '#fff'
        });

        if (ivUnequipConfirm.isConfirmed) {
            try {
                const ivUnequipResp = await axios.post("/point/main/store/inventory/unequip", {
                    inventoryNo: ivTargetItem.inventoryNo
                });

                if (ivUnequipResp.data === "success") {
                    toast.success("장착 해제되었습니다.");
                    ivLoadItems(); 
                    if (ivRefreshPoint) ivRefreshPoint(); 
                } else {
                    toast.error("해제 실패");
                }
            } catch (e) { toast.error("오류 발생"); }
        }
    };

    // [4] 환불 핸들러
    const ivHandleCancel = async (ivTargetItem) => {
        const ivRefundConfirm = await Swal.fire({
            title: '구매 취소/환불',
            text: "정말 환불하시겠습니까? 포인트가 즉시 복구됩니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: '환불하기',
            cancelButtonText: '취소',
            background: '#1a1a1a', color: '#fff'
        });

        if (ivRefundConfirm.isConfirmed) {
            try {
                await axios.post("/point/main/store/cancel", { inventoryNo: ivTargetItem.inventoryNo });
                toast.info("환불 처리가 완료되었습니다. 💸");
                ivLoadItems();
                if (ivRefreshPoint) ivRefreshPoint();
            } catch (err) { toast.error("환불 실패"); }
        }
    };

    // [5] 아이템 버리기 핸들러
    const ivHandleDiscard = async (ivTargetItem) => {
        const ivDiscardConfirm = await Swal.fire({
            title: '아이템 버리기',
            text: "정말 이 아이템을 삭제하시겠습니까? (복구 불가)",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '네, 버립니다',
            cancelButtonText: '취소',
            background: '#1a1a1a', color: '#fff'
        });

        if (ivDiscardConfirm.isConfirmed) {
            try {
                await axios.post("/point/main/store/inventory/delete", { inventoryNo: ivTargetItem.inventoryNo });
                toast.success("아이템을 성공적으로 버렸습니다.");
                ivLoadItems();
            } catch (err) { toast.error("삭제 실패"); }
        }
    };

    return (
        <div className="iv-container mt-3">
            <h5 className="text-white fw-bold mb-4 px-2">
                🎒 나의 보관함 <span className="text-secondary small">({ivItems.length})</span>
            </h5>
            
            {ivItems.length === 0 ? (
                <div className="iv-empty">
                    <span className="iv-empty-icon">📦</span>
                    <h5>보관함이 비어있습니다.</h5>
                    <p>스토어에서 아이템을 구매해보세요!</p>
                </div>
            ) : (
                <div className="iv-grid">
                    {ivItems.map((ivItem) => {
                        const ivIsEquipped = ivItem.inventoryEquipped === 'Y';
                        const ivIsDecoItem = ["DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME"].includes(ivItem.pointItemType);

                        return (
                            <div className={`iv-card ${ivIsEquipped ? 'iv-equipped-card' : ''}`} key={ivItem.inventoryNo}>
                                <div className="iv-img-box">
                                    {ivItem.pointItemSrc ? 
                                        <img src={ivItem.pointItemSrc} className="iv-img" alt={ivItem.pointItemName}/> 
                                        : <div className="iv-no-img">No Img</div>
                                    }
                                    <span className="iv-count-badge">x{ivItem.inventoryQuantity}</span>
                                    {ivIsEquipped && <span className="iv-equipped-overlay">ON</span>}
                                </div>
                                    
                                <div className="iv-info">
                                    <h6 className="iv-name" title={ivItem.pointItemName}>
                                        {ivItem.pointItemName}
                                    </h6>
                                    <span className="iv-type">{ivItem.pointItemType}</span>
                                </div>

                                <div className="iv-actions">
                                    {["CHANGE_NICK", "LEVEL_UP", "RANDOM_POINT", "VOUCHER", "DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME", "RANDOM_ICON", "HEART_RECHARGE"].includes(ivItem.pointItemType) && (
                                        <button 
                                            className="iv-btn iv-btn-use" 
                                            onClick={() => ivHandleUse(ivItem)}
                                            disabled={ivIsEquipped && ivIsDecoItem}
                                        >
                                            {ivItem.pointItemType === 'RANDOM_ICON' ? '뽑기' : 
                                             ivIsDecoItem ? (ivIsEquipped ? '사용중' : '장착') : '사용'}
                                        </button>
                                    )}
                                    
                                    {ivIsEquipped && ivIsDecoItem && (
                                        <button className="iv-btn iv-btn-unequip" onClick={() => ivHandleUnequip(ivItem)}>
                                            해제
                                        </button>
                                    )}

                                    {!ivIsEquipped && (
                                        <>
                                            <button className="iv-btn iv-btn-refund" onClick={() => ivHandleCancel(ivItem)}>환불</button>
                                            <button className="iv-btn iv-btn-delete" onClick={() => ivHandleDiscard(ivItem)}>버리기</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}