import React from "react";
import "../css/template-preview.css";
import { Crown } from "lucide-react";

export default function TemplatePreview({ tone="emerald" }) {
  return <div className={`template-preview tone-${tone}`}>
    <div className="preview-lines"><span/><span/><span/></div>
    <div className="preview-alert"><Crown size={15}/><div><b>NEW SUPPORTER</b><strong>Rohan • ₹1,000</strong></div></div>
    <div className="preview-corner">STREAMTIPS</div>
  </div>;
}
