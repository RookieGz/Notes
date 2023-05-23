## JPG
jpg图片是在网络上非常常见的图片格式，优点：文件大小较适中；适合储存照片和其他复杂图像。缺点：不支持透明度，可能会在压缩过程中丢失一些细节。最普遍使用的扩展名格式为.jpg，其他常用的扩展名还包括.JPEG、.jpe、.jfif以及.jif。JPEG格式的资料也能受嵌进其他类型的文件格式中，像是TIFF类型的文件格式。

## 为什么说JPG是有损压缩
因为JPG图片在传输的过程中用到了[离散余弦变换](https://zh.wikipedia.org/wiki/%E9%9B%A2%E6%95%A3%E9%A4%98%E5%BC%A6%E8%AE%8A%E6%8F%9B)，编码的时候需要将像素离散余弦变换，解码的时候使用反离散余弦变换，在这个过程中会损失一些数据。所以说JPG图片是一个有损压缩。下面我们探讨一下JPG的编码解码过程。（以下文案内容主要取自[维基百科](https://zh.wikipedia.org/wiki/JPEG)）

## 编码

### 色彩空间转换
首先，影像由RGB（红绿蓝）转换为一种称为YUV的不同色彩空间。这与模拟PAL制式彩色电视传输所使用的色彩空间相似，但是更类似于MAC电视传输系统运作的方式。但不是模拟NTSC，模拟NTSC使用的是YIQ色彩空间。

- Y成分表示一个像素的亮度
- U和V成分一起表示色调与饱和度。

YUV分量可以由PAL制系统中归一化（经过伽马校正）的R',G',B'经过下面的计算得到：

- Y=0.299R'+0.587G'+0.114B'
- U=-0.147R'-0.289G'+0.436B'
- V=0.615R'-0.515G'-0.100B'

这种编码系统非常有用，因为人眼对亮度差异的敏感度高于色彩变化。在此前提下可以设计更加高效压缩图像的编码器（encoder）。

### 缩减取样

经过RGB到YUV颜色空间的转换后，开始进行缩减采样来减少U和V的成分（称为"缩减取样"或"色度抽样"（chroma subsampling）。在JPEG上这种缩减取样的比例可以是4:4:4（无缩减取样），4:2:2（在水平方向2的倍数中取一个），以及最普遍的4:2:0（在水平和垂直方向2的倍数中取一个）。对于压缩过程的剩余部分，Y、U、和V都是以非常类似的方式来个别地处理。


### 离散余弦变换和量化

下一步，将影像中的每个成分（Y, U, V）生成三个区域，每一个区域再划分成如瓷砖般排列的一个个的8×8子区域，每一子区域使用二维的离散余弦变换（DCT）转换到频率空间。

具体的离散余弦变换过程和量化过程在下面代码中详细说明。

### 熵编码技术
熵编码是无损资料压缩的一个特别形式。它牵涉到将影像成分以Z字体（zigzag）排列，把相似频率组群在一起（矩阵中往左上方向是越低频率之系数，往右下较方向是较高频率之系数），插入长度编码的零，且接着对剩下的使用霍夫曼编码。 JPEG标准也允许（但是并不要求）在数学上优于霍夫曼编码的算术编码之使用。然而，这个特色几乎很少获使用，因为它被专利所涵盖，且它相较于霍夫曼编码在编码和解码上会更慢。使用算术编码一般会让文件更小约5%。
![image.png](/FILES/1c18147defbdcae231e81a500.png)


对于对一个矩阵进行Z字体序列会是：
![image.png](/FILES/1c18147defbdcae231e81a501.png)

转化后

−26,

−3, 0,

−3, −2, −6,

2, −4, 1, −3,

1, 1, 5, 1, 2,

−1, 1, −1, 2, 0, 0,

0, 0, 0, −1, −1, 0, 0,

0, 0, 0, 0, 0, 0, 0, 0,

0, 0, 0, 0, 0, 0, 0,

0, 0, 0, 0, 0, 0,

0, 0, 0, 0, 0,

0, 0, 0, 0,

0, 0, 0,

0, 0,

0

当剩下的所有系数都是零，对于过早结束的序列，JPEG有一个特别的霍夫曼编码用词。使用这个特殊的编码用词，EOB，该序列变为

−26,

−3, 0,

−3, −2, −6,

2, −4, 1 −3,

1, 1, 5, 1, 2,

−1, 1, −1, 2, 0, 0,

0, 0, 0, −1, −1, EOB

至此jpeg的编码就结束了，我们可以看到在大致过程：色彩空间转换 -> 缩减采样 -> 离散余弦变换 -> 量化 -> 熵编码技(压缩主要发生在这里，大概5%)

## 解码

解码来显示影像，包含反向作以上所有的过程，具体流程看下面代码

## 代码演示

如果我们想要在在JS里操作图片，首先想到的是使用canvas，先写一端代码

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        display: flex;
        justify-content: center;
      }

      .container canvas {
        margin: 0 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- 展示原图片 -->
      <canvas id="origin"></canvas>
      <!-- 展示编码，解码过程的图片 -->
      <canvas id="target"></canvas>
    </div>
  </body>
</html>
```
再实现一下JS代码
```javascript
// 使用Promise加载图片
function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      resolve(this);
    };
    img.onerror = function (e) {
      reject(e);
    };
    img.src = src;
  });
}

function RGBA2YUV(R, G, B) {
  const Y = 0.299 * R + 0.587 * G + 0.114 * B;
  const U = -0.169 * R - 0.331 * G + 0.5 * B + 128;
  const V = 0.5 * R - 0.419 * G - 0.081 * B + 128;
  return [Y, U, V];
}

function YUV2RBG(Y, U, V) {
  const R = Y + 1.403 * (V - 128); //
  const G = Y - 0.343 * (U - 128) - 0.714 * (V - 128);
  const B = Y + 1.77 * (U - 128);
  return [R, G, B, 255];
}

// 定义离散余弦变换函数
const Hash = {};

const getCoff = (index, length) => {
  if (!Hash[length]) {
    let coff = [];
    coff[0] = 1 / Math.sqrt(length);
    for (let i = 1; i < length; i++) {
      coff[i] = Math.sqrt(2) / Math.sqrt(length);
    }
    Hash[length] = coff;
  }
  return Hash[length][index];
};

const DCT = (signal) => {
  const L = signal.length;
  let tmp = Array(L * L).fill(0);
  let res = Array(L)
    .fill("")
    .map(() => []);
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      for (let x = 0; x < L; x++) {
        tmp[i * L + j] +=
          getCoff(j, L) *
          signal[i][x] *
          Math.cos(((2 * x + 1) * Math.PI * j) / 2 / L);
      }
    }
  }
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      for (let x = 0; x < L; x++) {
        res[i][j] =
          (res[i][j] || 0) +
          getCoff(i, L) *
            tmp[x * L + j] *
            Math.cos(((2 * x + 1) * Math.PI * i) / 2 / L);
      }
    }
  }
  return res;
};

const IDCT = (signal) => {
  const L = signal.length;
  let tmp = Array(L * L).fill(0);
  let res = Array(L)
    .fill("")
    .map(() => []);
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      for (let x = 0; x < L; x++) {
        tmp[i * L + j] +=
          getCoff(x, L) *
          signal[i][x] *
          Math.cos(((2 * j + 1) * x * Math.PI) / 2 / L);
      }
    }
  }
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      for (let x = 0; x < L; x++) {
        res[i][j] =
          (res[i][j] || 0) +
          getCoff(x, L) *
            tmp[x * L + j] *
            Math.cos(((2 * i + 1) * x * Math.PI) / 2 / L);
      }
    }
  }
  return res;
};

const Yquantify = [
  [16, 11, 10, 16, 24, 40, 51, 61],
  [12, 12, 14, 19, 26, 58, 60, 55],
  [14, 13, 16, 24, 40, 57, 69, 56],
  [14, 17, 22, 29, 51, 87, 80, 62],
  [18, 22, 37, 56, 68, 109, 103, 77],
  [24, 35, 55, 64, 81, 104, 113, 92],
  [49, 64, 78, 87, 103, 121, 120, 101],
  [72, 92, 95, 98, 112, 100, 103, 99],
];

const UVquantify = [
  [17, 18, 24, 47, 99, 99, 99, 99],
  [18, 21, 26, 66, 99, 99, 99, 99],
  [24, 26, 56, 99, 99, 99, 99, 99],
  [47, 66, 99, 99, 99, 99, 99, 99],
  [99, 99, 99, 99, 99, 99, 99, 99],
  [99, 99, 99, 99, 99, 99, 99, 99],
  [99, 99, 99, 99, 99, 99, 99, 99],
  [99, 99, 99, 99, 99, 99, 99, 99],
];

(async () => {
  const img = await loadImg("/images.jpeg");

  const origin = document.getElementById("origin");
  const target = document.getElementById("target");

  const originCtx = origin.getContext("2d");
  const targetCtx = target.getContext("2d");

  // 因为测试用例的图片是300 * 224, 宽度不是8的倍数， 设置成8的倍数好计算
  const [width, height] = [
    img.width - (img.width % 8),
    img.height - (img.height % 8),
  ];

  origin.width = width;
  origin.height = height;
  target.width = width;
  target.height = height;

  // 将图片绘制在origin
  originCtx.drawImage(img, 0, 0, width, height);
  console.log(width, height);
  const imgPixel = originCtx.getImageData(0, 0, width, height);

  // 因为ImageData是rgba的数据结合，每4位表示一个像素点的rgba值
  const fullRgba = Array.from(imgPixel.data);
  const rgba = [];
  for (let i = 0; i < fullRgba.length / 4; i++) {
    const [r, g, b, a] = fullRgba.slice(i * 4, i * 4 + 4);
    const [y, u, v] = RGBA2YUV(r, g, b);
    rgba.push({ i, r, g, b, a, y, u, v });
  }

  // 将图片的像素切分成8*8像素的矩阵
  const pixel8 = [];
  for (let i = 0; i < height / 8; i++) {
    for (let j = 0; j < width / 8; j++) {
      const s = Array.from({ length: 8 }).map((_, index) => {
        return rgba.slice(
          i * width * 8 + j * 8 + index * width,
          i * width * 8 + j * 8 + index * width + 8
        );
      });
      pixel8.push(s);
    }
  }

  const encodeDecode = pixel8.map((item) => {
    // 编码 - 离散余弦变换
    // 将影像中的每个成分（Y, U, V）生成三个区域，每一个区域再划分成如瓷砖般排列的一个个的8×8子区域，每一子区域使用二维的离散余弦变换（DCT）转换到频率空间。
    // 推移128，使其范围变为 -128~127
    const YS = item.map((r) => r.map((c) => c.y - 128));
    const US = item.map((r) => r.map((c) => c.u - 128));
    const VS = item.map((r) => r.map((c) => c.v - 128));

    // 且接着使用离散余弦变换，和舍位取最接近的整数
    const YSDCT = DCT(YS).map((v, i) =>
      v.map((q, j) => Math.round(q / Yquantify[i][j]))// 使用这个量化矩阵Yquantify与前面所得到的DCT系数矩阵逐项相除
    );
    const USDCT = DCT(US).map((v, i) =>
      v.map((q, j) => Math.round(q / UVquantify[i][j]))// 使用这个量化矩阵UVquantify与前面所得到的DCT系数矩阵逐项相除
    );
    const VSDCT = DCT(VS).map((v, i) =>
      v.map((q, j) => Math.round(q / UVquantify[i][j]))// 使用这个量化矩阵UVquantify与前面所得到的DCT系数矩阵逐项相除
    );

    // 因为这里主要展示的是编码 解码的过程，所以省略掉 熵编码的过程，直接进行解码

    // 解码
    // 取DCT系数矩阵，且以前面的量化矩阵乘以它，再使用反向DCT得到一个有数值的影像，最后对每一项加上128
    // 主要的损失就发生在这里，在进行反向DCT的时候矩阵中数值越大，差异就越大，差异主要来自反向DCT的过程。
    const YSIDCT = IDCT(
      YSDCT.map((v, i) => v.map((q, j) => q * Yquantify[i][j]))
    ).map((r) => r.map((c) => c + 128));
    const USIDCT = IDCT(
      USDCT.map((v, i) => v.map((q, j) => q * UVquantify[i][j]))
    ).map((r) => r.map((c) => c + 128));
    const VISDCT = IDCT(
      VSDCT.map((v, i) => v.map((q, j) => q * UVquantify[i][j]))
    ).map((r) => r.map((c) => c + 128));

    return item.map((r, i) =>
      r.map((c, j) => ({
        ...c,
        _y: YSIDCT[i][j],
        _u: USIDCT[i][j],
        _v: VISDCT[i][j],
      }))
    );
  });

  // 将8*8的矩阵转化回像素
  const decode = [];
  for (let i = 0; i < height / 8; i++) {
    const row8 = encodeDecode.slice((i * width) / 8, ((i + 1) * width) / 8);
    const s = Array.from({ length: 8 })
      .map((c, i) => row8.map((a) => a[i]).reduce((s, a) => [...s, ...a], []))
      .reduce((s, a) => [...s, ...a], []);
    decode.push(...s);
  }

  const targetPixel = decode
    .map((i) => {
      const [r, g, b] = YUV2RBG(i._y, i._u, i._v);
      return {
        ...i,
        _r: r,
        _g: g,
        _b: b,
      };
    })
    .map((b) => [b._r, b._g, b._b, 255])
    .flat(1);

  // 将转化后的图像绘制在canvas上
  targetCtx.putImageData(
    new ImageData(Uint8ClampedArray.from(targetPixel), width, height),
    0,
    0,
    0,
    0,
    width,
    height
  );
})();
```

以上就是使用JS实现的JPEG大致的编码，解码过程。


具体的效果可以访问仓库来查看：[仓库链接](https://github.com/RookieGz/js-code-jpg)

需要注意的是：

JPEG标准中许多选项很少使用，大多数图像软件在创建JPEG文件时使用更简单的JFIF格式。当应用到一个拥有每个像素24位（24 bits per pixel，红、蓝、绿各有八比特）的输入时，这边只有针对更多普遍编码方法之一的简洁描述。这个特定的选择是一种失真资料压缩方法。



