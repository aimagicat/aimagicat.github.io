#!/usr/bin/env bash
# 通用：只替换指定 classesN.dex 并重签名 APK（不整包回编译，避免资源错乱）
# 用法：
#   ./replace-dex-and-sign.sh [原始.apk] [DEX编号]
# 示例：
#   ./replace-dex-and-sign.sh                    # 当前目录下 baidujishu.apk，替换 classes10.dex
#   ./replace-dex-and-sign.sh myapp.apk          # 替换 myapp_decoded/smali_classes10 → classes10.dex
#   ./replace-dex-and-sign.sh myapp.apk 5       # 替换 smali_classes5 → classes5.dex

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ORIGINAL_APK="${1:-baidujishu.apk}"
DEX_INDEX="${2:-10}"
BASE_NAME="${ORIGINAL_APK%.apk}"
DECODED_DIR="${BASE_NAME}_decoded"
OUTPUT_APK="${BASE_NAME}_modified.apk"
SMALI_DIR="$DECODED_DIR/smali_classes$DEX_INDEX"
DEX_FILE="classes${DEX_INDEX}.dex"

TOOLS_DIR="tools"
SMALI_JAR="$TOOLS_DIR/smali-3.0.9-fat.jar"
SMALI_URL="https://github.com/baksmali/smali/releases/download/3.0.9/smali-3.0.9-fat.jar"

if [[ ! -f "$ORIGINAL_APK" ]]; then
  echo "错误: 未找到原始 APK: $ORIGINAL_APK"
  echo "用法: $0 [原始.apk] [DEX编号，默认10]"
  exit 1
fi

if [[ ! -d "$SMALI_DIR" ]]; then
  echo "错误: 未找到反编译目录: $SMALI_DIR"
  echo "请先用 apktool 反编译: apktool d $ORIGINAL_APK -o $DECODED_DIR"
  exit 1
fi

echo "原始 APK: $ORIGINAL_APK"
echo "反编译目录: $DECODED_DIR"
echo "替换 DEX: $DEX_FILE (来自 $SMALI_DIR)"
echo ""

echo "[1/5] 检查 smali 汇编器..."
if [[ ! -f "$SMALI_JAR" ]]; then
  echo "  未找到 $SMALI_JAR，正在下载..."
  mkdir -p "$TOOLS_DIR"
  curl -L -o "$SMALI_JAR" "$SMALI_URL" || { echo "下载失败，请手动将 smali-3.0.9-fat.jar 放到 $TOOLS_DIR/"; exit 1; }
fi

echo "[2/5] 将 smali_classes$DEX_INDEX 汇编为 $DEX_FILE..."
java -jar "$SMALI_JAR" assemble "$SMALI_DIR" -o "$DEX_FILE"

echo "[3/5] 在原 APK 上仅替换 $DEX_FILE（不重打整包，避免资源错乱）..."
cp -f "$ORIGINAL_APK" "$OUTPUT_APK"
zip -q -u "$OUTPUT_APK" "$DEX_FILE"
rm -f "$DEX_FILE"

echo "[4/5] 对齐与签名..."
BUILD_TOOLS=""
if [[ -n "$ANDROID_HOME" ]]; then
  for v in 34.0.0 33.0.2 33.0.1 30.0.3; do
    if [[ -d "$ANDROID_HOME/build-tools/$v" ]]; then
      BUILD_TOOLS="$ANDROID_HOME/build-tools/$v"
      break
    fi
  done
fi

if [[ -z "$BUILD_TOOLS" ]]; then
  echo "  未检测到 ANDROID_HOME 或 build-tools，跳过 zipalign/apksigner。"
  echo "  请手动执行："
  echo "    zipalign -f 4 $OUTPUT_APK ${OUTPUT_APK%.apk}_aligned.apk"
  echo "    apksigner sign --ks <你的keystore> --ks-pass pass:<密码> ${OUTPUT_APK%.apk}_aligned.apk"
  echo "  或安装 Android Studio 后设置 ANDROID_HOME 再重新运行本脚本。"
  echo "  未签名 APK 已生成: $OUTPUT_APK"
  exit 0
fi

ZIPALIGN="$BUILD_TOOLS/zipalign"
APKSIGNER="$BUILD_TOOLS/apksigner"
ALIGNED_APK="${OUTPUT_APK%.apk}_aligned.apk"

if [[ ! -x "$ZIPALIGN" ]]; then
  echo "  未找到 zipalign，跳过对齐与签名。未签名 APK: $OUTPUT_APK"
  exit 0
fi

$ZIPALIGN -f 4 "$OUTPUT_APK" "$ALIGNED_APK"
mv -f "$ALIGNED_APK" "$OUTPUT_APK"

if [[ -x "$APKSIGNER" ]]; then
  KEYSTORE="${KEYSTORE:-$HOME/.android/debug.keystore}"
  if [[ -f "$KEYSTORE" ]]; then
    echo "  使用 keystore: $KEYSTORE"
    SIGNED_APK="${OUTPUT_APK%.apk}_signed.apk"
    "$APKSIGNER" sign --ks "$KEYSTORE" --ks-pass pass:android --out "$SIGNED_APK" "$OUTPUT_APK" 2>/dev/null || \
      "$APKSIGNER" sign --ks "$KEYSTORE" --ks-pass pass:android "$OUTPUT_APK"
    echo "  已签名: $SIGNED_APK （安装: adb install -r $SIGNED_APK）"
  else
    echo "  未找到 $KEYSTORE，未执行签名。请用 apksigner 或 Android Studio 对 $OUTPUT_APK 签名后安装。"
  fi
else
  echo "  未找到 apksigner，请对 $OUTPUT_APK 手动签名后安装。"
fi

echo "完成。"
