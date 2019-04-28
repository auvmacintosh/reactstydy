import React, {useRef} from 'react';
import PropTypes from "prop-types";
import * as R from "ramda";
import {HALF_GAP} from "./CellArrangement";
import Item from "./Item";

const idxMp = R.addIndex(R.map);

const MasonryLayout = ({
                           matrix, getItem, columnWidth,
                           itemIndexUnderUpdating,
                           setItemIndexUnderUpdating,
                           pushCellHeight,
                           pushOffsetBottom
                       }) => {
    // console.log(itemIndexUnderUpdating)
    const columnNo = matrix.length;

    // table不能定义margin，会跟body margin collapse，导致判断是否滚动到底错误
    const tableStyle = {
        display: 'flex',
        justifyContent: 'center',
        padding: HALF_GAP + 'rem',
        minWidth: (columnWidth * columnNo) + 'rem',
    };
    const table = columns => (
        <div style={tableStyle}>
            {columns}
        </div>
    );

    const columnStyle = {
        display: 'flex',
        flexDirection: 'column',
        width: columnWidth + 'rem',
    };
    const column = (items, i) => (
        <div key={i} style={columnStyle}>
            {items}
        </div>
    );

    const cellStyle = {
        padding: HALF_GAP + 'rem',
        margin: '0',
        border: '0',
    };
    // const cell = ({item, itemIndex}) => {
    //     const ref = useRef(null);
    //     // console.log(itemIndex + ' ' + itemIndexUnderUpdating);
    //     if (itemIndex === itemIndexUnderUpdating) {
    //         const cellHeight = ref.current.clientHeight;
    //         const cellOffsetBottom = ref.current.offsetTop + cellHeight;
    //         pushCellHeight(cellHeight);
    //         pushOffsetBottom(cellOffsetBottom);
    //         setItemIndexUnderUpdating(-1);
    //     }
    //
    //     return (
    //         <div key={itemIndex} style={cellStyle} ref={ref}>
    //             <Item item={item}/>
    //         </div>
    //     )
    // };

    const cell = ({item, itemIndex}) => {
        if (itemIndex === itemIndexUnderUpdating) {
            pushCellHeight(36);
            pushOffsetBottom((Math.floor(itemIndex / columnNo) + 1) * 36);
            setItemIndexUnderUpdating(-1);
        }

        return (
            <div key={itemIndex} style={cellStyle}>
                <Item item={item}/>
            </div>
        )
    };
    // map(f)就是一层递归，也就是对Array里的每个元素使用f函数
    // map(map(f))就是两层递归
    const assembly = R.compose( // compose的作用就是把下边的函数串联起来
        table, // 打包一个table
        idxMp(column), // 打包n个column
        R.map(R.map(cell)), // 打包n*m个cell，这两层map可以优化成map(compose(a,b))
        R.map(R.map(getItem)) // 根据index查出对应的对象
    );

    // 输入matrix是一个n*m维的矩阵，每个元素都是index
    return (
        <>
            {assembly(matrix)}
        </>
    );
};

export default MasonryLayout;
