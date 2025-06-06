/*
 * (c) Copyright Ascensio System SIA 2010-2023
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function(window)
{
	let STYLES = new AscWord.CStyles(false);
	STYLES.Default.TextPr.Merge({
		RFonts : {
			Ascii : {Name : AscPDF.DEFAULT_FIELD_FONT, Index : -1},
			EastAsia : {Name : AscPDF.DEFAULT_FIELD_FONT, Index : -1},
			HAnsi : {Name : AscPDF.DEFAULT_FIELD_FONT, Index : -1},
			CS : {Name : AscPDF.DEFAULT_FIELD_FONT, Index : -1}
		}
	});
	
	/**
	 * Class for working with rich text
	 * @param parent - parent class in PDF structure
	 * @param {AscPDF.CPDFDoc} pdfDocument - reference to the main class
	 * @constructor
	 * @extends {AscWord.CDocumentContent}
	 */
	function CTextBoxContent(parent, pdfDocument) {
		AscWord.CDocumentContent.call(this, null, pdfDocument ? pdfDocument.GetDrawingDocument() : undefined, 0, 0, 0, 0, false, false, false);
		
		this.Content[0].LogicDocument = pdfDocument;
		
		this.ParentPDF = parent;
		this.PdfDoc    = pdfDocument;
		
		this.SetUseXLimit(false);
		this.MoveCursorToStartPos();
	}
	
	CTextBoxContent.prototype = Object.create(AscWord.CDocumentContent.prototype);
	CTextBoxContent.prototype.constructor = CTextBoxContent;
	
	CTextBoxContent.prototype.GetLogicDocument = function() {
		return this.PdfDoc;
	};
	CTextBoxContent.prototype.SetAlign = function(alignType) {
		let _alignType = AscCommon.align_Left;
		switch (alignType) {
			case AscPDF.ALIGN_TYPE.left:
				_alignType = AscCommon.align_Left;
				break;
			case AscPDF.ALIGN_TYPE.center:
				_alignType = AscCommon.align_Center;
				break;
			case AscPDF.ALIGN_TYPE.right:
				_alignType = AscCommon.align_Right;
				break;
		}
		
		this.SetApplyToAll(true);
		this.SetParagraphAlign(_alignType);
		this.GetElement(0).RecalcCompiledPr(true);
		this.SetApplyToAll(false);
	};
	CTextBoxContent.prototype.GetAlign = function() {
		let align = this.GetElement(0).GetParagraphAlign();
		
		switch (align) {
			case align_Left: return AscPDF.ALIGN_TYPE.left;
			case align_Center: return AscPDF.ALIGN_TYPE.center;
			case align_Right: return AscPDF.ALIGN_TYPE.right;
		}
		
		return AscPDF.ALIGN_TYPE.left;
	};
	CTextBoxContent.prototype.IsUseInDocument = function() {
		// TODO: Временно, потом надо будет запрашивать у родительского класса
		return true;
	};
	CTextBoxContent.prototype.OnContentReDraw = function() {
		// TODO: Реализовать
	};
	CTextBoxContent.prototype.GetStyles = function() {
		return STYLES;
	};
	CTextBoxContent.prototype.SetFont = function(fontName) {
		this.SetApplyToAll(true);
		this.AddToParagraph(new AscWord.ParaTextPr({RFonts : {Ascii : {Name : fontName, Index : -1}}}));
		this.SetApplyToAll(false);
	};
	CTextBoxContent.prototype.SetFontSize = function(fontSize) {
		this.SetApplyToAll(true);
		this.AddToParagraph(new AscWord.ParaTextPr({FontSize : fontSize}));
		this.SetApplyToAll(false);
	};
	CTextBoxContent.prototype.getCurrentRun = function() {
		let paragraph = this.GetElement(0);
		if (!paragraph || !paragraph.IsParagraph())
			return null;
		
		let paraPos = paragraph.Get_ParaContentPos(false);
		let run = paragraph.GetElementByPos(paraPos);
		if (!run || !(run instanceof AscWord.CRun))
			return null;
		
		return run;
	};
	CTextBoxContent.prototype.replaceAllText = function(value) {
		let codePoints = typeof(value) === "string" ? value.codePointsArray() : value;
		
		let paragraph = this.GetElement(0);
		if (!paragraph || !paragraph.IsParagraph())
			return;
		
		let run = paragraph.GetElement(0);
		if (!run || !(run instanceof AscWord.CRun))
			return;
		
		paragraph.RemoveFromContent(1, paragraph.GetElementsCount() - 1);
		run.ClearContent();
		
		for (let index = 0, inRunIndex = 0, count = codePoints.length; index < count; ++index) {
			let runElement = AscWord.codePointToRunElement(codePoints[index]);
			if (runElement)
				run.AddToContent(inRunIndex++, runElement, true);
		}
		this.MoveCursorToEndPos();
	};
	CTextBoxContent.prototype.getAllText = function() {
		let paragraph = this.GetElement(0);
		if (!paragraph || !paragraph.IsParagraph())
			return "";
		
		paragraph.SetApplyToAll(true);
		let text = paragraph.GetSelectedText(true, {NewLine: true});
		paragraph.SetApplyToAll(false);
		return text;
	};
	CTextBoxContent.prototype.OnContentChange = function() {
		if (this.ParentPDF && this.ParentPDF.OnContentChange)
			this.ParentPDF.OnContentChange();
	};
	
	//--------------------------------------------------------export----------------------------------------------------
	window['AscPDF'] = window['AscPDF'] || {};
	window['AscPDF'].CTextBoxContent = CTextBoxContent;
	
	
})(window);

