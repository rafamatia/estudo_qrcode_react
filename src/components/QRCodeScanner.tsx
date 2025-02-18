import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

const QRCodeScanner: React.FC = () => {
    const [qrResult, setQrResult] = useState<string>("");
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const codeReader = useRef(new BrowserMultiFormatReader());
    const scannerControls = useRef<IScannerControls | null>(null);

    useEffect(() => {
        if (isScanning && videoRef.current) {
            codeReader.current.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result) => {
                    if (result) {
                        setQrResult(result.getText());
                        stopScanning();
                    }
                }
            ).then((controls) => {
                scannerControls.current = controls;
            }).catch((error) => {
                console.error("Erro ao iniciar a câmera:", error);
            });
        }

        return () => stopScanning();
    }, [isScanning]);

    const startScanning = () => setIsScanning(true);
    const stopScanning = () => {
        setIsScanning(false);
        scannerControls.current?.stop();
    };

    return (
        <div>
            <h1>Leitor de QR Code</h1>

            {isScanning ? (
                <div>
                    <video ref={videoRef} style={{ width: "100%", maxWidth: "500px" }} />
                    <button onClick={stopScanning} style={buttonStyle}>Parar Leitura</button>
                </div>
            ) : (
                <button onClick={startScanning} style={buttonStyle}>Iniciar Leitura</button>
            )}

            {qrResult && <p><strong>Resultado:</strong> {qrResult}</p>}
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px"
};

export default QRCodeScanner;