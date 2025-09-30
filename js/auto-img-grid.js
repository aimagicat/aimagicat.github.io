function initAutoImgGrid() {
  // 只在文章页面执行
  if (!document.querySelector("#article-container")) return;

  const container = document.querySelector("#article-container");
  if (!container) return;

  // 查找所有段落中的连续图片
  const paragraphs = container.querySelectorAll("p");

  let replacedMultiImgCount = 0; // 记录被替换的多图段落数量

  paragraphs.forEach(function (p) {
    const images = p.querySelectorAll("img");

    // 如果段落中有多张图片，应用网格布局
    if (images.length > 1) {
      // 添加网格容器类
      p.classList.add("auto-img-grid");

      // 根据图片数量添加对应的类
      let gridClass = "";
      if (images.length === 2) {
        gridClass = "grid-2";
      } else if (images.length === 3) {
        gridClass = "grid-3";
      } else if (images.length === 4) {
        gridClass = "grid-4";
      } else {
        gridClass = "grid-many";
      }

      // 给每张图片添加网格类
      images.forEach(function (img) {
        img.classList.add(gridClass);
      });

      replacedMultiImgCount++; // 计数
    }
  });

  // 处理连续的单独图片段落（相邻的p标签，每个包含一张图片）
  const allPs = Array.from(container.querySelectorAll("p"));
  let consecutiveImgPs = [];
  let replacedConsecutiveCount = 0; // 记录被替换的连续图片组数量

  allPs.forEach(function (p, index) {
    const img = p.querySelector("img");
    const hasOnlyImg =
      img && p.children.length === 1 && p.textContent.trim() === "";

    if (hasOnlyImg) {
      consecutiveImgPs.push(p);
    } else {
      // 处理之前收集的连续图片段落
      if (consecutiveImgPs.length > 1) {
        processConsecutiveImages(consecutiveImgPs);
        replacedConsecutiveCount++; // 计数
      }
      consecutiveImgPs = [];
    }
  });

  // 处理最后一组连续图片
  if (consecutiveImgPs.length > 1) {
    processConsecutiveImages(consecutiveImgPs);
    replacedConsecutiveCount++; // 计数
  }

  // 输出日志，提示替换了多少组
  if (replacedMultiImgCount > 0 || replacedConsecutiveCount > 0) {
    console.log(
      `[auto-img-grid] 已替换多图段落: ${replacedMultiImgCount} 组，连续单图段落: ${replacedConsecutiveCount} 组`
    );
  }

  function processConsecutiveImages(imgParagraphs) {
    if (imgParagraphs.length < 2) return;

    // 创建网格容器
    const gridContainer = document.createElement("div");
    gridContainer.classList.add("auto-img-grid");

    // 确定网格类型
    let gridClass = "";
    if (imgParagraphs.length === 2) {
      gridClass = "grid-2";
    } else if (imgParagraphs.length === 3) {
      gridClass = "grid-3";
    } else if (imgParagraphs.length === 4) {
      gridClass = "grid-4";
    } else {
      gridClass = "grid-many";
    }

    // 移动图片到网格容器
    imgParagraphs.forEach(function (p, index) {
      const img = p.querySelector("img");
      if (img) {
        img.classList.add(gridClass);
        gridContainer.appendChild(img);
      }

      // 移除空的段落（除了第一个，我们会用它来放置网格容器）
      if (index > 0) {
        p.remove();
      }
    });

    // 替换第一个段落的内容
    const firstP = imgParagraphs[0];
    firstP.innerHTML = "";
    firstP.appendChild(gridContainer);
  }
}

// 初始执行
initAutoImgGrid();

// 注册pjax完成后的回调
btf.addGlobalFn("pjaxComplete", initAutoImgGrid, "autoImgGrid");
