// 自动图片网格布局脚本
document.addEventListener("DOMContentLoaded", function () {
  // 只在文章页面执行
  if (!document.querySelector("#article-container")) return;

  const container = document.querySelector("#article-container");
  if (!container) return;

  // 查找所有段落中的连续图片
  const paragraphs = container.querySelectorAll("p");

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
    }
  });

  // 处理连续的单独图片段落（相邻的p标签，每个包含一张图片）
  const allPs = Array.from(container.querySelectorAll("p"));
  let consecutiveImgPs = [];

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
      }
      consecutiveImgPs = [];
    }
  });

  // 处理最后一组连续图片
  if (consecutiveImgPs.length > 1) {
    processConsecutiveImages(consecutiveImgPs);
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
});
