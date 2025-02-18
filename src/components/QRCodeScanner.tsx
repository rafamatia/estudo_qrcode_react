import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr"; // Importa a biblioteca jsQR

const CameraComponent: React.FC = () => {
    const [cameraType, setCameraType] = useState<string>("environment"); // "environment" para traseira, "user" para frontal
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null); // Estado para armazenar o QR code lido
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Referência para o canvas

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera(); // Parar a câmera quando o componente for desmontado
        };
    }, [cameraType]); // Recomeçar a câmera caso o tipo de câmera seja alterado

    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    facingMode: cameraType, // "user" para câmera frontal e "environment" para traseira
                },
            };

            // Verifica se a câmera está acessível
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("Stream da câmera obtido:", stream);

            if (videoRef.current) {
                console.log("Elemento video encontrado!");
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    requestAnimationFrame(scanQRCode); // Inicia a leitura do QR Code
                };
                videoRef.current.onerror = (error) => {
                    console.error("Erro ao carregar o vídeo:", error);
                    setCameraError("Erro ao carregar o vídeo da câmera.");
                };
            } else {
                console.error("Elemento video não encontrado!");
                setCameraError("Elemento de vídeo não encontrado.");
            }

            setCameraError(null); // Limpar qualquer erro anterior

        } catch (error) {
            console.error("Erro ao acessar a câmera:", error);
            setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    };

    const scanQRCode = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                // Define o tamanho do canvas igual ao do vídeo
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Desenha o frame atual do vídeo no canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Obtém a imagem do canvas
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    console.log("QR Code detectado:", code.data);
                    setQrCode(code.data); // Atualiza o estado com o QR Code lido
                }
            }
        }

        // Continua a leitura do QR Code
        requestAnimationFrame(scanQRCode);
    };

    return (
        <div>
            <h1>Abrir Câmera</h1>

            {/* Seleção da câmera */}
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                <label>
                    Câmera:
                    <select
                        onChange={(e) => setCameraType(e.target.value)}
                        value={cameraType}
                        style={{ padding: "5px 10px", fontSize: "16px", cursor: "pointer" }}
                    >
                        <option value="environment">Traseira</option>
                        <option value="user">Frontal</option>
                    </select>
                </label>
            </div>

            {/* Exibição do vídeo */}
            {cameraError ? (
                <p style={{ color: "red" }}>{cameraError}</p>
            ) : (
                <video ref={videoRef} style={{ width: "100%", maxWidth: "500px", border: "2px solid black", borderRadius: "5px" }} autoPlay playsInline />
            )}

            {/* Exibição do QR Code detectado */}
            {qrCode && (
                <div style={{ marginTop: "20px" }}>
                    <h2>QR Code Detectado:</h2>
                    <p>{qrCode}</p>
                </div>
            )}

            {/* Canvas invisível para capturar os frames do vídeo */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
};

export default CameraComponent;


