const _Set = function () {

}

/**
 * 交集
 */
_Set.intersect = function (arrA, arrB) {
    let SetB = new Set([...arrB])
    // 此处的has, 还可以用数组的indexof,find,findIndex方法
    // ES5: indexof
    // ES6: find,findIndex
    return arrA.filter(item => SetB.has(item))
}

/**
 * 差集
 */
_Set.minus = function (arrA, arrB) {
    let SetB = new Set([...arrB])
    return arrA.filter(item => !SetB.has(item))
}

/**
 * 并集
 */
_Set.union = function (arrA, arrB) {
    return Array.from(new Set([...arrA, ...arrB]))
}

/**
 * 补集
 */
_Set.complement = function (arrA, arrB) {
    let SetA = new Set([...arrA])
    let SetB = new Set([...arrB])
    return [...arrA.filter(item => !SetB.has(item)), ...arrB.filter(item => !SetA.has(item))]
}