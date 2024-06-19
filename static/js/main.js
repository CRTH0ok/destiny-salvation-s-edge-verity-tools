/*********************************************************
* @author		Araby
* @version		1.0
* @date		    2024/6/18
* @des	        救赎边缘老四外场图形置换工具
**********************************************************/
let checkedObj = {
    left: {
        inside: '',
        outside: '',
    },
    middle: {
        inside: '',
        outside: '',
    },
    right: {
        inside: '',
        outside: '',
    }
}

$(window).on('load', () => {
    event_click_changeChkedObj();
    //checkedObj = {
    //    left: {
    //        inside: 'circle',
    //        outside: 'sphere',
    //    },
    //    middle: {
    //        inside: 'square',
    //        outside: 'cube',
    //    },
    //    right: {
    //        inside: 'triangle',
    //        outside: 'pyramid',
    //    }
    //}
    //checkedObj = {
    //    left: {
    //        inside: 'circle',
    //        outside: 'cube',
    //    },
    //    middle: {
    //        inside: 'square',
    //        outside: 'pyramid',
    //    },
    //    right: {
    //        inside: 'triangle',
    //        outside: 'sphere',
    //    }
    //}
    calculator();
})

function event_click_changeChkedObj() {
    $('.twoDimension').on('click', function () {
        const _position = $(this).parent().attr('data-position');
        const _shape = $(this).attr('data-graphic');
        if (!!$(this).hasClass('unable')) {
            return false;
        }
        if (checkedObj[_position].inside == _shape) {
            checkedObj[_position].inside = '';
            $(`.twoDimensionList[data-position="${_position}"] .twoDimension[data-graphic="${_shape}"]`).removeClass('selected');
            $(`.twoDimensionList .twoDimension[data-graphic="${_shape}"]`).removeClass('unable');
        }
        else {
            $(`.twoDimensionList .twoDimension[data-graphic="${checkedObj[_position].inside}"]`).removeClass('unable');
            checkedObj[_position].inside = _shape;
            $(`.twoDimensionList[data-position="${_position}"] .twoDimension`).removeClass('selected');
            $(`.twoDimensionList[data-position="${_position}"] .twoDimension[data-graphic="${_shape}"]`).addClass('selected');
            $(`.twoDimensionList[data-position!="${_position}"] .twoDimension[data-graphic="${_shape}"]`).addClass('unable');
        }
        calculator();
    });
    $('.threeDimension').on('click', function () {
        const _position = $(this).parent().attr('data-position');
        const _shape = $(this).attr('data-graphic');
        console.log(_position, _shape);
        if (!!$(this).hasClass('unable')) {
            return false;
        }
        if (checkedObj[_position].outside == _shape) {
            checkedObj[_position].outside = '';
            $(`.threeDimensionList[data-position="${_position}"] .threeDimension[data-graphic="${_shape}"]`).removeClass('selected');
        }
        else {
            checkedObj[_position].outside = _shape;
            $(`.threeDimensionList[data-position="${_position}"] .threeDimension`).removeClass('selected');
            $(`.threeDimensionList[data-position="${_position}"] .threeDimension[data-graphic="${_shape}"]`).addClass('selected');
        }
        calculator();
    })
}

function calculator() {
    $('#txtStep').html('');
    //全部不为空触发
    if (checkedObj.left.inside != '' && checkedObj.left.outside != '' && checkedObj.middle.inside != '' &&
        checkedObj.middle.outside != '' && checkedObj.right.inside != '' && checkedObj.right.outside != '') {
        const inside_need_twoDimension = [];        //顺序是从左往右
        const outside_need_threeDimension = [];
        const leftInsideNeeds_2D = returnInsideNeedsTwoDimension(checkedObj.left.inside, 'left');
        const middleInsideNeeds_2D = returnInsideNeedsTwoDimension(checkedObj.middle.inside, 'middle');
        const rightInsideNeeds_2D = returnInsideNeedsTwoDimension(checkedObj.right.inside, 'right');

        const leftOutsideMapping_2D = returnOutsideMappingTwoDimension(checkedObj.left.outside);
        const middleOutsideMapping_2D = returnOutsideMappingTwoDimension(checkedObj.middle.outside);
        const rightOutsideMapping_2D = returnOutsideMappingTwoDimension(checkedObj.right.outside);

        const leftNeedDisplace = returnDisplaceGraphical(leftInsideNeeds_2D, leftOutsideMapping_2D);
        const middleNeedDisplace = returnDisplaceGraphical(middleInsideNeeds_2D, middleOutsideMapping_2D);
        const rightNeedDisplace = returnDisplaceGraphical(rightInsideNeeds_2D, rightOutsideMapping_2D);

        const target = [leftNeedDisplace.insideNeeds_2D_target, middleNeedDisplace.insideNeeds_2D_target, rightNeedDisplace.insideNeeds_2D_target];
        const displaceGraphical = [leftNeedDisplace.outsideMapping_2D_displaceGraphical, middleNeedDisplace.outsideMapping_2D_displaceGraphical, rightNeedDisplace.outsideMapping_2D_displaceGraphical];

        let stepOptStr = '';
        const _positionDesc = {
            0: '左边',
            1: '中间',
            2: '右边'
        }
        const _graphicalDesc = {
            circle: '圆形',
            square: '正方形',
            triangle: '三角形',
        }
        let stepNum = 0;
        for (var i = 0; i < displaceGraphical.length; i++) {
            //需要置换
            if (displaceGraphical[i].length != 0) {
                for (var i_i = 0; i_i < displaceGraphical[i].length; i_i++) {
                    for (var j = i + 1; j < displaceGraphical.length; j++) {
                        if (displaceGraphical[j].length != 0) {
                            const _index = displaceGraphical[j].indexOf(target[i][i_i]);
                            if (_index > -1 && displaceGraphical[i][i_i] !== displaceGraphical[j][_index]) {
                                stepOptStr += `<br/>第${++stepNum}步： 将${_positionDesc[i]}的${_graphicalDesc[displaceGraphical[i][i_i]]}与${_positionDesc[j]}的${_graphicalDesc[displaceGraphical[j][_index]]}交换`
                                displaceGraphical[j][_index] = displaceGraphical[i][i_i];
                                displaceGraphical[i][i_i] = target[i][i_i];
                            }
                        }
                    }
                }
            }
        }
        $('#txtStep').html(stepOptStr);
    }
}

/**
 * 返回需要的二维图形
 * @param {any} twoDimension_All
 * @param {any} insideTwoDimension
 * @returns
 */
function returnInsideNeedsTwoDimension(insideTwoDimension) {
    const twoDimension_All = ['circle', 'square', 'triangle'];
    const needsTwoDimension = twoDimension_All.filter(e => e != insideTwoDimension);
    return needsTwoDimension;
}

/**
 * 返回外场三维图形映射的二维图形
 * @param {any} outsideThreeDimension
 * @returns
 */
function returnOutsideMappingTwoDimension(outsideThreeDimension) {
    const threeDimension_twoDimension_Mapping = {   //三维与二维图形映射
        sphere: ['circle', 'circle'],
        cylinder: ['circle', 'square'],
        cone: ['circle', 'triangle'],
        cube: ['square', 'square'],
        prism: ['triangle', 'square'],
        pyramid: ['triangle', 'triangle'],
    };
    return threeDimension_twoDimension_Mapping[outsideThreeDimension];
}

/**
 * 返回需要置换的图形
 * @param {any} insideNeeds_2D
 * @param {any} outsideMapping_2D
 * @returns
 */
function returnDisplaceGraphical(insideNeeds_2D, outsideMapping_2D) {
    let i = 0;
    while (i < insideNeeds_2D.length) {
        let isDelete = false;
        let j = 0;
        while (j < outsideMapping_2D.length) {
            if (insideNeeds_2D[i] == outsideMapping_2D[j]) {
                outsideMapping_2D.splice(j, 1);
                insideNeeds_2D.splice(i, 1);
            }
            else {
                j++;
            }
        }
        i++
    }
    return ({ insideNeeds_2D_target: insideNeeds_2D, outsideMapping_2D_displaceGraphical: outsideMapping_2D });
}
