import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const genTrackId = () =>
  "SH-" + Math.floor(100 + Math.random() * 900) + "-" + Date.now().toString().slice(-4);

const SERVICE_MAP = {
  standard:  "Standard (5-7 days)",
  express:   "Express Air (2-3 days)",
  overnight: "Overnight (Next day)",
};

const TODAY = new Date().toISOString().split("T")[0];

const INP = {
  width: "100%", padding: "10px 12px",
  border: "1px solid #d1d5db", borderRadius: 6,
  fontSize: 13.5, fontFamily: "'Inter',sans-serif",
  color: "#001F3F", background: "#fff", outline: "none",
  transition: "border .18s, box-shadow .18s",
};

const LBL = { fontSize: 13, color: "#374151", marginBottom: 5, display: "block" };

/* ── Field defined OUTSIDE to prevent remount on every keystroke ── */
function Field({ label, name, value, onChange, type, required, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LBL}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <input
        type={type || "text"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ""}
        required={!!required}
        style={INP}
        onFocus={e => {
          e.target.style.borderColor = "#FFAB00";
          e.target.style.boxShadow = "0 0 0 3px rgba(255,171,0,.18)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "#d1d5db";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

/* ── SelectField defined OUTSIDE ── */
function SelectField({ label, name, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LBL}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={!!required}
        style={{ ...INP, appearance: "none", cursor: "pointer" }}
        onFocus={e => {
          e.target.style.borderColor = "#FFAB00";
          e.target.style.boxShadow = "0 0 0 3px rgba(255,171,0,.18)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "#d1d5db";
          e.target.style.boxShadow = "none";
        }}
      >
        {options.map(o => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Barcode SVG defined OUTSIDE ── */
function Barcode({ value }) {
  const chars = value.replace(/[^A-Z0-9]/g, "").split("");
  const W = 220, H = 52;
  const bw = W / Math.max(chars.length, 1);
  return (
    <svg width={W} height={H} viewBox={"0 0 " + W + " " + H} style={{ display: "block" }}>
      {chars.map((c, i) => {
        const code = c.charCodeAt(0);
        const w = bw * (code % 3 === 0 ? 0.55 : code % 3 === 1 ? 0.35 : 0.75);
        return <rect key={i} x={i * bw} y={0} width={w} height={H} fill="#001F3F" />;
      })}
    </svg>
  );
}

/* ── PrintLabel defined OUTSIDE ── */
function PrintLabel({ data, innerRef }) {
  const { trackId, sender, receiver, shipment, createdAt } = data;
  return (
    <div
      ref={innerRef}
      style={{
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 12,
        overflow: "hidden",
        width: 560,
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <div style={{ background: "#001F3F", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FFAB00", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#001F3F", fontSize: 14 }}>CF</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>CargoFlow</div>
            <div style={{ color: "rgba(255,255,255,.45)", fontSize: 10 }}>Logistics and Delivery</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#FFAB00", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Service</div>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{SERVICE_MAP[shipment.service]}</div>
        </div>
      </div>

      <div style={{ background: "#f8fafc", padding: "14px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" }}>Tracking ID</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#001F3F", letterSpacing: 1, fontFamily: "monospace" }}>{trackId}</div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Generated: {createdAt}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Barcode value={trackId} />
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 3, fontFamily: "monospace", letterSpacing: 1 }}>
            {trackId.replace(/[^A-Z0-9]/g, "")}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: "16px 22px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>From</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#001F3F" }}>{sender.name}</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>
            {sender.address}<br />
            {sender.city}{sender.pincode ? " - " + sender.pincode : ""}<br />
            {sender.phone}<br />
            {sender.email}
          </div>
        </div>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #e2e8f0", background: "#fffbeb" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#FFAB00", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>To</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#001F3F" }}>{receiver.name}</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>
            {receiver.address}<br />
            {receiver.city}{receiver.pincode ? " - " + receiver.pincode : ""}<br />
            {receiver.phone}<br />
            {receiver.email}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 22px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { l: "Weight",     v: shipment.weight + " kg" },
            { l: "Dimensions", v: shipment.length + "x" + shipment.width + "x" + shipment.height + " cm" },
            { l: "Pieces",     v: shipment.pieces },
            { l: "Ship Date",  v: shipment.shipDate },
          ].map(d => (
            <div key={d.l}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" }}>{d.l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#001F3F", marginTop: 2 }}>{d.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" }}>Est. Delivery</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0fa869" }}>{shipment.estDelivery || "-"}</div>
        </div>
        {shipment.description && (
          <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", maxWidth: 220, textAlign: "right" }}>
            "{shipment.description}"
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function CustomerShippingLabel() {
  const labelRef = useRef(null);
  const stored = JSON.parse(localStorage.getItem("current_user") || "null");

  const [step,      setStep]      = useState(1);
  const [generated, setGenerated] = useState(null);
  const [toast,     setToast]     = useState({ show: false, msg: "" });

  const [sender, setSender] = useState({
    name: stored?.name || "", email: stored?.email || "",
    phone: "", address: "", city: "", pincode: "",
  });
  const [receiver, setReceiver] = useState({
    name: "", email: "", phone: "", address: "", city: "", pincode: "",
  });
  const [shipment, setShipment] = useState({
    weight: "", length: "", width: "", height: "",
    pieces: "1", service: "standard",
    shipDate: TODAY, estDelivery: "", description: "",
  });

  const toast$ = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  /* stable handlers — defined once, no remount */
  const onSender   = (e) => setSender(p   => ({ ...p, [e.target.name]: e.target.value }));
  const onReceiver = (e) => setReceiver(p => ({ ...p, [e.target.name]: e.target.value }));
  const onShipment = (e) => setShipment(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleGenerate = (e) => {
    e.preventDefault();
    setGenerated({
      trackId: genTrackId(),
      sender, receiver, shipment,
      createdAt: new Date().toLocaleString("en-IN"),
    });
    setStep(2);
    toast$("Shipping label generated!");
  };

  const handlePrint = () => {
    const html = labelRef.current?.outerHTML;
    if (!html) return;
    const w = window.open("", "_blank");
    w.document.write(
      "<html><head><title>Shipping Label</title>" +
      "<style>*{box-sizing:border-box;margin:0;padding:0;}" +
      "body{font-family:Inter,Arial,sans-serif;padding:24px;background:#fff;}" +
      "@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}" +
      "</style></head><body>" + html + "</body></html>"
    );
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  const handleDownload = async () => {
    const el = labelRef.current;
    if (!el) {
      // No label generated yet — generate first then download
      toast$("Please generate the label first, then download");
      return;
    }
    toast$("Preparing PDF...");
    try {
      // Render the label div to a canvas at 2x resolution
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

      const filename = "shipping-label-" + (generated?.trackId || "cargoflow") + ".pdf";
      pdf.save(filename); // auto-saves to PC downloads folder
      toast$("PDF saved to your Downloads folder!");
    } catch (err) {
      console.error(err);
      toast$("Download failed — try Print instead");
    }
  };

  const handleShare = async () => {
    if (!generated) return;
    const text =
      "Shipping Label\n" +
      "Tracking: " + generated.trackId + "\n" +
      "From: " + generated.sender.name + ", " + generated.sender.city + "\n" +
      "To: " + generated.receiver.name + ", " + generated.receiver.city + "\n" +
      "Service: " + SERVICE_MAP[generated.shipment.service];
    if (navigator.share) {
      try { await navigator.share({ title: "Shipping Label", text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text).catch(() => {});
    toast$("Label details copied to clipboard!");
  };

  const sectionHead = (icon, title) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18, paddingBottom: 10, borderBottom: "2px solid #f3f4f6" }}>
      <span style={{ color: "#FFAB00", fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#001F3F" }}>{title}</span>
    </div>
  );

  const actionBtn = (label, bg, onClick) => (
    <button
      onClick={onClick}
      style={{
        background: bg, border: bg === "#fff" ? "1.5px solid #d1d5db" : "none",
        color: bg === "#fff" ? "#374151" : "#fff",
        padding: "12px 28px", borderRadius: 10,
        fontWeight: 700, fontSize: 14, cursor: "pointer",
        fontFamily: "'Inter',sans-serif",
        display: "flex", alignItems: "center", gap: 8,
        transition: "opacity .2s",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{
        "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');" +
        "*{box-sizing:border-box;margin:0;padding:0;}" +
        "@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}" +
        "@keyframes toastIn{from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);}}" +
        ".csl-card{animation:fadeUp .45s ease both;}"
      }</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80&auto=format&fit=crop')",
          backgroundSize: "cover", backgroundPosition: "center 40%",
          opacity: 0.09, filter: "saturate(0.5) brightness(0.9)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(245,245,245,.75) 0%,rgba(245,245,245,.6) 100%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Breadcrumb + title — no back button */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#FFAB00" }}>Logistics</span>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{">"}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#FFAB00" }}>Label Generator</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#001F3F", letterSpacing: "-.5px" }}>Shipping Label</h1>
        </div>

        {/* STEP 1 — FORM */}
        {step === 1 && (
          <form onSubmit={handleGenerate}>
            <div className="csl-card" style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,31,63,.10),0 1px 4px rgba(0,31,63,.06)", padding: "36px 40px" }}>

              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "#001F3F", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 12 }}>
                  <span>&#128230;</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#001F3F" }}>Shipping Details Required</h2>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Please fill in the shipment information to generate your label</p>
              </div>

              {/* Sender + Receiver */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 28 }}>
                <div>
                  {sectionHead("->", "Sender Information")}
                  <Field label="Full Name / Company" name="name"    value={sender.name}    onChange={onSender} required placeholder="Priyanka Garg" />
                  <Field label="Address"             name="address" value={sender.address} onChange={onSender} required placeholder="123, Street Name, Area" />
                  <Field label="City"                name="city"    value={sender.city}    onChange={onSender} required placeholder="Mumbai" />
                  <Field label="Phone"               name="phone"   value={sender.phone}   onChange={onSender} required placeholder="+91 98765 43210" />
                  <Field label="Email"               name="email"   value={sender.email}   onChange={onSender} required type="email" placeholder="you@example.com" />
                  <Field label="PIN Code"            name="pincode" value={sender.pincode} onChange={onSender} placeholder="400001" />
                </div>
                <div>
                  {sectionHead("v", "Receiver Information")}
                  <Field label="Full Name / Company" name="name"    value={receiver.name}    onChange={onReceiver} required placeholder="Rahul Sharma" />
                  <Field label="Address"             name="address" value={receiver.address} onChange={onReceiver} required placeholder="456, Street Name, Area" />
                  <Field label="City"                name="city"    value={receiver.city}    onChange={onReceiver} required placeholder="Delhi" />
                  <Field label="Phone"               name="phone"   value={receiver.phone}   onChange={onReceiver} required placeholder="+91 98765 00000" />
                  <Field label="Email"               name="email"   value={receiver.email}   onChange={onReceiver} required type="email" placeholder="receiver@example.com" />
                  <Field label="PIN Code"            name="pincode" value={receiver.pincode} onChange={onReceiver} placeholder="110001" />
                </div>
              </div>

              {/* Shipment Details */}
              <div style={{ borderTop: "2px solid #f3f4f6", paddingTop: 24, marginBottom: 28 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#001F3F", marginBottom: 18 }}>Shipment Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 24px" }}>
                  <Field label="Weight (kg)"          name="weight"      value={shipment.weight}      onChange={onShipment} required placeholder="24.5" />
                  <Field label="Dimensions (LxWxH cm)"name="length"      value={shipment.length}      onChange={onShipment} required placeholder="60 x 40 x 35" />
                  <SelectField label="Service Level"  name="service"     value={shipment.service}     onChange={onShipment} required
                    options={[
                      { v: "standard",  l: "Standard (5-7 days)"   },
                      { v: "express",   l: "Express Air (2-3 days)" },
                      { v: "overnight", l: "Overnight (Next day)"   },
                    ]}
                  />
                  <Field label="Number of Pieces" name="pieces"      value={shipment.pieces}      onChange={onShipment} required placeholder="3" />
                  <Field label="Ship Date"        name="shipDate"    value={shipment.shipDate}    onChange={onShipment} required type="date" />
                  <Field label="Est. Delivery"    name="estDelivery" value={shipment.estDelivery} onChange={onShipment} type="date" />
                </div>
                <Field label="Package Description (optional)" name="description" value={shipment.description} onChange={onShipment} placeholder="e.g. Electronics, Clothing, Documents" />
              </div>

              <button type="submit" style={{
                width: "100%", padding: "15px", background: "#001F3F", border: "none",
                borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Inter',sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#002d5a"}
                onMouseLeave={e => e.currentTarget.style.background = "#001F3F"}
              >
                Generate Shipping Label
              </button>

              {/* Print + Download buttons under the form */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                <button type="button" onClick={handlePrint}
                  style={{ padding: "16px", background: "#001F3F", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(0,31,63,.25)", transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print Label
                </button>
                <button type="button" onClick={handleDownload}
                  style={{ padding: "16px", background: "#FFAB00", border: "none", borderRadius: 14, color: "#001F3F", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(255,171,0,.35)", transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
                  </svg>
                  Download as PDF
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2 — LABEL + ACTIONS */}
        {step === 2 && generated && (
          <div className="csl-card">
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,31,63,.10)", padding: "32px 40px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginBottom: 20 }}>
                Your Shipping Label — ready to print, download or share
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <PrintLabel data={generated} innerRef={labelRef} />
              </div>

              {/* Action buttons BELOW the label — large, prominent */}
              <div style={{ display: "flex", gap: 14, marginTop: 32, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handlePrint}
                  style={{ background: "#001F3F", border: "none", color: "#fff", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(0,31,63,.25)", transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <span style={{ fontSize: 18 }}>&#128424;</span> Print Label
                </button>
                <button onClick={handleDownload}
                  style={{ background: "#3b82f6", border: "none", color: "#fff", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(59,130,246,.3)", transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <span style={{ fontSize: 18 }}>&#11015;</span> Download PDF
                </button>
                <button onClick={handleShare}
                  style={{ background: "#0fa869", border: "none", color: "#fff", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(15,168,105,.3)", transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <span style={{ fontSize: 18 }}>&#128279;</span> Share
                </button>
                <button onClick={() => setStep(1)}
                  style={{ background: "#fff", border: "1.5px solid #d1d5db", color: "#374151", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 10, transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  &#9998; Edit Details
                </button>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,31,63,.10)", padding: "24px 32px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#001F3F", marginBottom: 14 }}>Label Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                {[
                  { l: "Tracking ID",   v: generated.trackId },
                  { l: "From",          v: generated.sender.name + ", " + generated.sender.city },
                  { l: "To",            v: generated.receiver.name + ", " + generated.receiver.city },
                  { l: "Service",       v: SERVICE_MAP[generated.shipment.service] },
                  { l: "Weight",        v: generated.shipment.weight + " kg" },
                  { l: "Pieces",        v: generated.shipment.pieces },
                  { l: "Ship Date",     v: generated.shipment.shipDate },
                  { l: "Est. Delivery", v: generated.shipment.estDelivery || "-" },
                ].map(s => (
                  <div key={s.l} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em" }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#001F3F", marginTop: 3 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast.show && (
        <div style={{ position: "fixed", bottom: 28, right: 28, background: "#001F3F", color: "#fff", padding: "12px 24px", borderRadius: 40, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(0,31,63,.3)", zIndex: 9999, animation: "toastIn .3s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
