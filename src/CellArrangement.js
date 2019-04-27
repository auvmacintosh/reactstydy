import React, {useState, useContext, useRef, useCallback} from 'react';
import PropTypes from "prop-types";
import {ContextFs, ContextWiw} from "./GlobalState";
import CellArrangementDS from "./CellArrangementDS";
import MasonryLayout from "./MasonryLayout";

const MIN_COLUMN_NO = 1; // 最少这么多列
export const HALF_GAP = 0.8; // rem
// todo: 当宽度小到一定程度，判断为手机用户，列宽占满屏幕
const getColumnWidth = (fs, wiw) => {
    return 20; // rem
};
const getColumnNo = (fs, wiw) => {
    let completeColumnNo = Math.floor((wiw - 2 * HALF_GAP * fs)
        / (getColumnWidth(wiw) * fs));
    // 最小也得是2列，不能返回0列
    return Math.max(MIN_COLUMN_NO, completeColumnNo);
};

let ds = new CellArrangementDS();
let prevColumnWidth = 0; // 窗口宽度改变的时候，需要拿之前的列宽和现在的列宽比较
let prevColumnNo = 0; // 窗口宽度改变的时候，需要拿之前的列数和现在的列数比较
let itemIndexUnderUpdating = -1; // 正在更新的item的index，只有判断自己是这个item的时候，才会更新height和offsetBottom

const CellArrangement = ({items}) => {
    const fs = useContext(ContextFs); // Font size
    const wiw = useContext(ContextWiw); // Window inner width
    const columnWidth = getColumnWidth(fs, wiw);
    const columnNo = getColumnNo(fs, wiw)
    const cwds = ds.getCwds(columnWidth);
    const cnds = ds.getCwds(columnWidth).getCnds(columnNo);
    const [matrix, setMatrix] = useState([]);
    const getItem = useRef(itemIndex => ({itemIndex: itemIndex, item: items[itemIndex]}));
    const pushCellHeight = useCallback(cwds.pushCellHeight, [fs, wiw]);
    const pushOffsetBottom = useCallback(cnds.pushOffsetBottom, [fs, wiw])

    // let cellArrangementDS = {
    //     20: { // ColumnWidthDS
    //         2: { // ColumnNoDS
    //             itemIndexMatrix: [[], []],
    //             offsetBottomMatrix: [[], []],
    //         },
    //         3: {}, // ColumnNoDS
    //         cellHeights: [],
    //         getCnds: (cn) => {
    //         }
    //     },
    //     30: {},
    //
    //     getCwds: (wiw) => {
    //     },
    // };
    let lci = cnds.getLastCellsItemIndex();
    let chl = cwds.cellHeights.length;
    // 如果列宽或者列数改变了
    if (prevColumnWidth !== columnWidth || prevColumnNo !== columnNo) {
        prevColumnWidth = columnWidth;
        prevColumnNo = columnNo;
        if (lci + 1 === items.length) { // 为了优化性能，如果true，肯定会跑下边的if，那必然有setMatrix，这里的就省了
            setMatrix(() => cnds.itemIndexMatrix);
        }
    }
    if (lci + 1 < chl) {
        console.log(cnds.itemIndexMatrix);
        for (let i = lci + 1; i < chl; i++) { // 列数改变了
            cnds.concatItemIndex(i);
            cnds.pushOffsetBottom(cnds.getShortestColumnHeight() + cwds.cellHeights[i])
        }
        if (chl === items.length) {
            setMatrix(() => cnds.itemIndexMatrix);
        }
    }
    if (chl < items.length) {
        console.log("new data: " + chl + ';   ' + items.length);
        setTimeout(() => {
            // 把一次items的改变拆成一个一个item render，render之后再设置itemHeight和offsetBottom
            console.log('callback');
            for (let i = chl; i < items.length; i++) { // 有新下载的内容
                itemIndexUnderUpdating = i;
                cnds.concatItemIndex(i);
                console.log('concat' + i)
                pushCellHeight(20);
                pushOffsetBottom((Math.floor(i/3)+1)*20);
                setMatrix(() => cnds.itemIndexMatrix);
                itemIndexUnderUpdating = -1;
            }
        }, 0);
    }

    return (
        <MasonryLayout matrix={matrix} getItem={getItem} columnWidth={columnWidth}
                       itemIndexUnderUpdating={itemIndexUnderUpdating}
                       pushCellHeight={pushCellHeight}
                       pushOffsetBottom={pushOffsetBottom}
        />
    )
};

CellArrangement.propTypes = {
    items: PropTypes.array.isRequired,
};

export default CellArrangement;
