import React from "react";
import "../css/template-card.css";
import { ArrowRight, Eye, Heart } from "lucide-react";
import Button from "./Button";
import TemplatePreview from "./TemplatePreview";

export default function TemplateCard({ template }) {
  return <div className="template-card">
    <div className="template-image"><TemplatePreview tone={template.tone}/><button className="preview-btn"><Eye size={15}/> Preview</button></div>
    <div className="template-info"><div><h3>{template.name}</h3><p>{template.category}</p></div><button className="icon-btn"><Heart size={17}/></button></div>
    <div className="tags">{template.tags.map(x=><span key={x}>{x}</span>)}</div>
    <Button variant="outline" className="full">Use template <ArrowRight size={15}/></Button>
  </div>;
}
