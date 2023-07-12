# 前言
最近失业在家，闲来无事，就一直想实现之前很在意的苹果健康中的定时器样式。
苹果手机将睡眠闹钟移动到健康APP里之后，睡眠的定时器功能我非常喜欢。通过拖动端点来确定睡眠时间，移动整个滑块设置时间段，这个交互在前端中不太常见，接下来就分析这个功能如何实现。本篇博客只讨论如何实现UI，其他的功能暂时不实现。

![RPReplay_Final1689056404-2.gif](/FILES/4d97bb8ec9ddef1a1a1709c00.gif)

# 需求分析

首先来分析这个功能的重点：

1. 整个可交互的位置只有滑块（slip），所有的功能都围绕着计算如何和滑块交互，这个滑块由左右可拖动的顶点(pointLeft，pointRight)和滑块中间的位置组成。
2. 拖动滑块中间的位置可以将整个滑块拖动，此时左右顶点和滑块中间的位置作为一个整体滑动。
3. **重点：** 当拖动某一顶点的时候，只端点滑动，同时滑块中间的位置相应的伸长或缩短，当到达某一临界值的时候又可以整体滑动，即**左右顶点不能相交**。

确定好需求之后我们来写代码。

# 开始

主要的技术：React + TS + canvas

在JS当中想要创建一条弧线，那么首选就是canvas，先进行准备工作。


```tsx
function Sliper() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    // 用于记录当前canvas及元素的信息
    const [ctxInfo, setCtxInfo] = useState<{
    ctx: CanvasRenderingContext2D
        width: number // 画布宽度
        height: number // 画布高度
        centerX: number // 画布中心位置X
        centerY: number // 画布中心位置Y
        clockR: number // 中央表盘的半径
        sliperWidth: number // 滑块宽度
        spaceWidth: number // 滑块和中央表盘的距离
    } | null>(null)
    
     useEffect(() => {
    if (canvasRef.current) {
      // 开始准备工作
      const canvas = canvasRef.current
      const [width, height] = [canvas.width, canvas.height]
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      setCtxInfo({
        ctx,
        width,
        height,
        centerX: width / 2,
        centerY: height / 2,
        clockR: 100,
        sliperWidth: 24,
        spaceWidth: 5,
      })
    }
  }, [canvasRef.current])

    return <canvas ref={canvasRef} width={800} height={500} />
}

export default Sliper    
```

根据上面分析我们还需要两个变量slipAngleL，slipAngleR，分别用来记录左右顶点当前的角度。PS：作者更习惯坐标系的取值范围是0 ～ 2π，所以本文接下来的所有角度将转化到这个角度范围。

```ts
  const [slipAngleL, setSlipAngleL] = useState((Math.PI * 3) / 4) // 曲线左顶点的角度
  const [slipAngleR, setSlipAngleR] = useState((Math.PI * 1) / 4) // 曲线右顶点的角度
```

接下来要先确定几个常量
```ts
// 判定为顶点的夹角
const POINT_ANGLE = Math.PI / 12
// 格式化角度的函数
const formatAngle = (angle: number) => {
    if (angle > Math.PI * 2) return angle - Math.PI * 2
    if (angle < 0) return angle + Math.PI * 2
    return angle
  }
```

当确定知道了左右顶点的角度，我们就可以根据角度来画出基础的图形。

```ts
  // 每次根据左右顶点的改变重新绘制图像
  useEffect(() => {
    if (ctxInfo) {
      const {
        ctx,
        centerX,
        centerY,
        clockR,
        sliperWidth,
        width,
        height,
        spaceWidth,
      } = ctxInfo

      ctx.clearRect(0, 0, width, height) // 清楚上一次的绘画
      ctx.beginPath()
      ctx.arc(centerX, centerY, clockR, 0, 2 * Math.PI) // 画出表盘
      ctx.fill()

      ctx.beginPath()
      ctx.lineWidth = sliperWidth
      // 根据左右顶点角度画出弧线
      ctx.arc(
        centerX,
        centerY,
        clockR + sliperWidth / 2 + spaceWidth,
        slipAngleL,
        slipAngleR
      )
      ctx.stroke()

      ctx.beginPath()
      // 画出左顶点，用红色表示
      ctx.strokeStyle = 'red'
      ctx.arc(
        centerX,
        centerY,
        clockR + sliperWidth / 2 + spaceWidth,
        slipAngleL,
        formatAngle(slipAngleL + POINT_ANGLE)
      )
      ctx.stroke()
      ctx.closePath()

      ctx.beginPath()
      // 画出右顶点，用绿色表示
      ctx.strokeStyle = 'green'
      ctx.arc(
        centerX,
        centerY,
        clockR + sliperWidth / 2 + spaceWidth,
        formatAngle(slipAngleR - POINT_ANGLE),
        slipAngleR
      )
      ctx.stroke()
      ctx.strokeStyle = 'black'
      ctx.closePath()
    }
  }, [ctxInfo, slipAngleL, slipAngleR, isDrappingPoint])

```
打开页面我们可以得出这样的画面

![截屏2023-07-11 15.33.27.png](/FILES/4d97bb8ec9ddef1a1a1709c01.33.27.png)

好丑。。。，不过不要紧，重要的是功能

基础完成后需要给图形加上事件，一个重要的问题就是如何判断鼠标是否在滑块上：
- 通过鼠标的位置到中心的位置可以判读是否在滑轨上
- 通过鼠标与水平线的夹角来判断是否在左右顶点之间

那么我们可以写出代码

```ts
const [isDrappingPoint, setDrapping] = useState<'l' | 'r' | false>(false) // 是否开始拖动顶点

const isOnSlip = useCallback(
    (e: any) => {
      if (ctxInfo) {
        const [mouseX, mouseY] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
        const { centerX, centerY, clockR, sliperWidth, spaceWidth } =
          ctxInfo

        // 鼠标到中心的距离
        const r = Math.sqrt(
          Math.pow(Math.abs(mouseX - centerX), 2) +
            Math.pow(Math.abs(mouseY - centerY), 2)
        )

        // 鼠标到中心的角度
        let angle = Math.atan2(mouseY - centerY, mouseX - centerX)
        if (angle < 0) angle = Math.PI * 2 + angle // 统一范围在0 ～ 2π之间

        const langle = slipAngleL
        // 默认情况下右测节点的角度都比左侧节点角度大，但是也有特殊情况，就是右测节点已经转过一圈了所以要加上2π
        const rangle =
          slipAngleR < slipAngleL ? slipAngleR + 2 * Math.PI : slipAngleR 

        const cangle = angle < slipAngleL ? angle + 2 * Math.PI : angle

        const result =
          r < clockR + spaceWidth + sliperWidth &&
          r > clockR + spaceWidth &&
          cangle - langle < rangle - langle

        // 副作用 - 判断是否鼠标在拖动顶点
        // 当鼠标位置与顶点位置夹角小于 Math.PI / 12 被视为在拖动顶点
        if (result) {
          // 点击位置与左右节点的差值
          const ldiff = Math.abs(slipAngleL - angle)
          const rdiff = Math.abs(slipAngleR - angle)

          if (ldiff > POINT_ANGLE && rdiff > POINT_ANGLE) setDrapping(false)
          if (ldiff > POINT_ANGLE && rdiff < POINT_ANGLE) setDrapping('r')
          if (ldiff < POINT_ANGLE && rdiff > POINT_ANGLE) setDrapping('l')
        } else {
          setDrapping(false)
        }

        // 副作用结束

        return result
      }
      return false
    },
    [ctxInfo, slipAngleL, slipAngleR]
  )
```

这样`isOnSlip`可以判断鼠标是否在滑块上，为后续的事件提供便利

下面来添加事件

鼠标的拖动事件需要添加`mouseDown`、`mouseUp`、`mouseMove`三个事件，

设置一个变量，当鼠标按下的时候设置为true，鼠标移动的时候判断这个变量是否为true，为true的时候开始拖动事件，当鼠标抬起的时候将这个变量设置为false。

```ts

  // 鼠标按下事件
  const mouseDown = useCallback<MouseEventHandler>(
    (e) => {
      if (isOnSlip(e)) {
        setMouseIsDown(true)
        // 记录当前鼠标位置
        mouseLastPsition.current = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        }
      }
    },
    [isOnSlip]
  )

  // 鼠标抬起事件
  const mouseUp = useCallback<MouseEventHandler>((e) => {
    setMouseIsDown(false)
    setDrapping(false)
  }, [])

  // 鼠标移动事件
  const mouseMove = useCallback<MouseEventHandler>(
    (e) => {
      if (mouseIsDown && ctxInfo) {
        const { centerX, centerY } = ctxInfo
        const { x: mouseLastX, y: mouseLastY } = mouseLastPsition.current

        // 根据鼠标开始的坐标计算初始角度
        let startAngle = Math.atan2(mouseLastY - centerY, mouseLastX - centerX)
        if (startAngle < 0) startAngle = Math.PI * 2 + startAngle
        
        // 根据鼠标当前的坐标计算当前角度
        let mouseAngle = Math.atan2(
          e.nativeEvent.offsetY - centerY,
          e.nativeEvent.offsetX - centerX
        )
        if (mouseAngle < 0) mouseAngle = Math.PI * 2 + mouseAngle

        mouseLastPsition.current = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        }

        const targetL = formatAngle(slipAngleL + mouseAngle - startAngle)
        const targetR = formatAngle(slipAngleR + mouseAngle - startAngle)

        // 拖动顶点
        if (isDrappingPoint) {
          if (isDrappingPoint === 'l') {
            // 计算夹角的弧度值的差值
            const delta = Math.abs(targetL - slipAngleR)
            const angleBetween = Math.min(delta, 2 * Math.PI - delta)
            // 边缘判断 设置拖动角度的极限值，被拖动的节点在固定节点的无论左右都不能小于MIN_ANGLE的角度
            if (
              Number(angleBetween.toFixed(2)) >= Number(MIN_ANGLE.toFixed(2))
            ) {
              setSlipAngleL(targetL)
              return
            }
          } else {
            const delta = Math.abs(targetR - slipAngleL)
            const angleBetween = Math.min(delta, 2 * Math.PI - delta)
            if (
              Number(angleBetween.toFixed(2)) >= Number(MIN_ANGLE.toFixed(2))
            ) {
              setSlipAngleR(targetR)
              return
            }
          }
        }

        // 整体拖动
        setSlipAngleL(targetL)
        setSlipAngleR(targetR)
      }

      if (isOnSlip(e)) {
        e.currentTarget.setAttribute('style', 'cursor: pointer;')
      } else {
        e.currentTarget.setAttribute('style', '')
      }
    },
    [slipAngleL, slipAngleR, isOnSlip, mouseIsDown, isDrappingPoint]
  )

```

那么到目前为止，就把基础功能完成了，可以滑块的整体拖动，左右节点的单独拖动和极限值的判断。
![屏幕录制2023-07-11-14.06.08.gif](/FILES/4d97bb8ec9ddef1a1a1709c02.06.08.gif)

线上体验地址：[https://xzgz.top/blog/example/sliper](https://xzgz.top/blog/example/sliper)

全部代码： 

```tsx
import {
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

const CanvasStyled = styled.canvas`
  background-color: #ccc;
`

// 可拖动的最小夹角
const MIN_ANGLE = (Math.PI * 5) / 24
// 判定为顶点的夹角
const POINT_ANGLE = Math.PI / 12

function Tester() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctxInfo, setCtxInfo] = useState<{
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    centerX: number
    centerY: number
    clockR: number
    sliperWidth: number
    spaceWidth: number
  } | null>(null)

  const [slipAngleL, setSlipAngleL] = useState((Math.PI * 3) / 4) // 曲线左顶点的角度
  const [slipAngleR, setSlipAngleR] = useState((Math.PI * 1) / 4) // 曲线右顶点的角度

  const [mouseIsDown, setMouseIsDown] = useState(false) // 鼠标是否点击
  const mouseLastPsition = useRef({ x: 0, y: 0 }) // 鼠标上次位移的位置

  const [isDrappingPoint, setDrapping] = useState<'l' | 'r' | false>(false) // 是否开始拖动顶点

  // 绘制图形时处理角度 控制角度在 0 ～ Math.PI * 2
  const formatAngle = useCallback((angle: number) => {
    if (angle > Math.PI * 2) return angle - Math.PI * 2
    if (angle < 0) return angle + Math.PI * 2
    return angle
  }, [])

  // 每次根据左右顶点的改变重新绘制图像
  useEffect(() => {
    if (ctxInfo) {
      const {
        ctx,
        centerX,
        centerY,
        clockR,
        sliperWidth,
        width,
        height,
        spaceWidth,
      } = ctxInfo

      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      ctx.arc(centerX, centerY, clockR, 0, 2 * Math.PI)
      ctx.fill()

      ctx.beginPath()
      ctx.lineWidth = sliperWidth
      // ctx.lineCap = 'round'
      ctx.arc(
        centerX,
        centerY,
        clockR + sliperWidth / 2 + spaceWidth,
        slipAngleL,
        slipAngleR
      )
      ctx.stroke()

      ctx.beginPath()
      ctx.strokeStyle = 'red'
      ctx.arc(
        centerX,
        centerY,
        clockR + sliperWidth / 2 + spaceWidth,
        slipAngleL,
        formatAngle(slipAngleL + POINT_ANGLE)
      )
      ctx.stroke()
      ctx.closePath()

      ctx.beginPath()
      ctx.strokeStyle = 'green'
      ctx.arc(
        centerX,
        centerY,
        clockR + sliperWidth / 2 + spaceWidth,
        formatAngle(slipAngleR - POINT_ANGLE),
        slipAngleR
      )
      ctx.stroke()
      ctx.strokeStyle = 'black'
      ctx.closePath()
    }
  }, [ctxInfo, slipAngleL, slipAngleR, isDrappingPoint])

  useEffect(() => {
    if (canvasRef.current) {
      // 开始准备工作
      const canvas = canvasRef.current
      const [width, height] = [canvas.width, canvas.height]
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      setCtxInfo({
        ctx,
        width,
        height,
        centerX: width / 2,
        centerY: height / 2,
        clockR: 100,
        sliperWidth: 24,
        spaceWidth: 5,
      })
    }
  }, [canvasRef.current])

  // 判断鼠标是否在滑块上
  const isOnSlip = useCallback(
    (e: any) => {
      if (ctxInfo) {
        const [mouseX, mouseY] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
        const { centerX, centerY, clockR, sliperWidth, spaceWidth } = ctxInfo

        // 鼠标到中心的距离
        const r = Math.sqrt(
          Math.pow(Math.abs(mouseX - centerX), 2) +
            Math.pow(Math.abs(mouseY - centerY), 2)
        )

        // 鼠标到中心的角度
        let angle = Math.atan2(mouseY - centerY, mouseX - centerX)
        if (angle < 0) angle = Math.PI * 2 + angle

        const langle = slipAngleL
        const rangle =
          slipAngleR < slipAngleL ? slipAngleR + 2 * Math.PI : slipAngleR

        const cangle = angle < slipAngleL ? angle + 2 * Math.PI : angle

        const result =
          r < clockR + spaceWidth + sliperWidth &&
          r > clockR + spaceWidth &&
          cangle - langle < rangle - langle

        // 副作用 - 判断是否鼠标在拖动顶点
        // 当鼠标位置与顶点位置夹角小于 Math.PI / 12 被视为在拖动顶点
        if (result) {
          // 点击位置与左右节点的差值
          const ldiff = Math.abs(slipAngleL - angle)
          const rdiff = Math.abs(slipAngleR - angle)

          if (ldiff > POINT_ANGLE && rdiff > POINT_ANGLE) setDrapping(false)
          if (ldiff > POINT_ANGLE && rdiff < POINT_ANGLE) setDrapping('r')
          if (ldiff < POINT_ANGLE && rdiff > POINT_ANGLE) setDrapping('l')
        } else {
          setDrapping(false)
        }

        // 副作用结束

        return result
      }
      return false
    },
    [slipAngleL, slipAngleR, ctxInfo]
  )

  // 鼠标按下事件
  const mouseDown = useCallback<MouseEventHandler>(
    (e) => {
      if (isOnSlip(e)) {
        setMouseIsDown(true)
        mouseLastPsition.current = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        }
      }
    },
    [isOnSlip]
  )

  // 鼠标抬起事件
  const mouseUp = useCallback<MouseEventHandler>((e) => {
    setMouseIsDown(false)
    setDrapping(false)
  }, [])

  // 鼠标移动事件
  const mouseMove = useCallback<MouseEventHandler>(
    (e) => {
      if (mouseIsDown && ctxInfo) {
        const { centerX, centerY } = ctxInfo
        const { x: mouseLastX, y: mouseLastY } = mouseLastPsition.current

        let startAngle = Math.atan2(mouseLastY - centerY, mouseLastX - centerX)
        if (startAngle < 0) startAngle = Math.PI * 2 + startAngle

        let mouseAngle = Math.atan2(
          e.nativeEvent.offsetY - centerY,
          e.nativeEvent.offsetX - centerX
        )
        if (mouseAngle < 0) mouseAngle = Math.PI * 2 + mouseAngle

        mouseLastPsition.current = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        }

        const targetL = formatAngle(slipAngleL + mouseAngle - startAngle)
        const targetR = formatAngle(slipAngleR + mouseAngle - startAngle)

        // 拖动顶点
        if (isDrappingPoint) {
          if (isDrappingPoint === 'l') {
            const delta = Math.abs(targetL - slipAngleR)
            // 计算夹角的弧度值
            const angleBetween = Math.min(delta, 2 * Math.PI - delta)
            if (
              Number(angleBetween.toFixed(2)) >= Number(MIN_ANGLE.toFixed(2))
            ) {
              setSlipAngleL(targetL)
              return
            }
          } else {
            const delta = Math.abs(targetR - slipAngleL)
            // 计算夹角的弧度值
            const angleBetween = Math.min(delta, 2 * Math.PI - delta)
            if (
              Number(angleBetween.toFixed(2)) >= Number(MIN_ANGLE.toFixed(2))
            ) {
              setSlipAngleR(targetR)
              return
            }
          }
        }

        // 整体拖动
        setSlipAngleL(targetL)
        setSlipAngleR(targetR)
      }

      if (isOnSlip(e)) {
        e.currentTarget.setAttribute('style', 'cursor: pointer;')
      } else {
        e.currentTarget.setAttribute('style', '')
      }
    },
    [slipAngleL, slipAngleR, isOnSlip, mouseIsDown, isDrappingPoint, ctxInfo]
  )

  return (
    <CanvasStyled
      ref={canvasRef}
      width={800}
      height={500}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      onMouseMove={mouseMove}
    />
  )
}

export default Tester

```

原创不易，点个赞/关注吧❤️
























