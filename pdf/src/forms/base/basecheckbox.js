/*
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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

(function(){

    let CHECKBOX_STYLES = {
        check:      0,
        cross:      1,
        diamond:    2,
        circle:     3,
        star:       4,
        square:     5
    }
    
    /**
	 * Class representing a base checkbox class.
	 * @constructor
     * @extends {CBaseField}
	 */
    function CBaseCheckBoxField(sName, sType, nPage, aRect, oDoc)
    {
        AscPDF.CBaseField.call(this, sName, sType, nPage, aRect, oDoc);

        this._value         = "Off";
        this._exportValue   = "Yes";
        this._chStyle       = CHECKBOX_STYLES.check;
        this._checked       = false;

        // states
        this._pressed = false;
        this._hovered = false;
    };
    
    CBaseCheckBoxField.prototype = Object.create(AscPDF.CBaseField.prototype);
    CBaseCheckBoxField.prototype.constructor = CBaseCheckBoxField;

    CBaseCheckBoxField.prototype.Draw = function(oGraphicsPDF) {
        if (this.IsHidden() == true)
            return;

        let aRect = this.GetRect();

        let X       = aRect[0];
        let Y       = aRect[1];
        let nWidth  = (aRect[2] - aRect[0]);
        let nHeight = (aRect[3] - aRect[1]);

        // save pos in page.
        this._pagePos = {
            x: X,
            y: Y,
            w: nWidth,
            h: nHeight
        };

        this.DrawBackground(oGraphicsPDF);
        this.DrawBorders(oGraphicsPDF);

        if (true == this.IsChecked())
            this.DrawCheckedSymbol(oGraphicsPDF);
    };
    CBaseCheckBoxField.prototype.IsChecked = function() {
        return this._checked;
    };
    CBaseCheckBoxField.prototype.SetPressed = function(bValue) {
        this._pressed = bValue;
        this.AddToRedraw();
    };
    CBaseCheckBoxField.prototype.IsPressed = function() {
        return this._pressed;
    };
    CBaseCheckBoxField.prototype.IsHovered = function() {
        return this._hovered;
    };
    CBaseCheckBoxField.prototype.SetHovered = function(bValue) {
        this._hovered = bValue;
    };
    CBaseCheckBoxField.prototype.DrawCheckedSymbol = function(oGraphicsPDF) {
        let aOrigRect       = this.GetOrigRect();

        let X       = aOrigRect[0];
        let Y       = aOrigRect[1];
        let nWidth  = aOrigRect[2] - aOrigRect[0];
        let nHeight = aOrigRect[3] - aOrigRect[1];

        let oMargins = this.GetMarginsFromBorders(false, false);
        let oRGB    = this.GetRGBColor(this._textColor);

        oGraphicsPDF.SetGlobalAlpha(1);
        oGraphicsPDF.SetStrokeStyle(oRGB.r, oRGB.g, oRGB.b);
        oGraphicsPDF.SetFillStyle(oRGB.r, oRGB.g, oRGB.b);
        oGraphicsPDF.SetLineWidth(1);
        oGraphicsPDF.SetLineDash([]);

        switch (this._chStyle) {
            case CHECKBOX_STYLES.circle: {
                let centerX = X + nWidth / 2;
                let centerY = Y + nHeight / 2;
                let nRadius = Math.abs(Math.min(nWidth / 4 - oMargins.left / 2, nHeight / 4 - oMargins.top / 2));
                oGraphicsPDF.BeginPath();
                oGraphicsPDF.Arc(centerX, centerY, nRadius, 0, 2 * Math.PI, false);
                oGraphicsPDF.Fill();
                break;
            }
                
            case CHECKBOX_STYLES.cross: {
                let x = nWidth > nHeight ? X + (nWidth - nHeight) / 2 : X;
                let y = nHeight > nWidth ? Y + (nHeight - nWidth) / 2 : Y;
                let w = Math.min(nWidth, nHeight);


                // left to right
                oGraphicsPDF.BeginPath();
                oGraphicsPDF.MoveTo(x + (oMargins.left + w * 0.05), y + (oMargins.top + w * 0.05));
                oGraphicsPDF.LineTo(x + w - (oMargins.left + w * 0.05), y + w - (oMargins.top + w * 0.05));
                oGraphicsPDF.Stroke();

                // right to left
                oGraphicsPDF.BeginPath();
                oGraphicsPDF.MoveTo(x + w - (oMargins.left + w * 0.05), y + (oMargins.top + w * 0.05));
                oGraphicsPDF.LineTo(x + (oMargins.left + w * 0.05), y + w - (oMargins.top + w * 0.05));
                oGraphicsPDF.Stroke();
                break;
            }
                
            case CHECKBOX_STYLES.diamond: {
                let nDiamondWidth = Math.min(nWidth - oMargins.left * 1.5, nHeight - oMargins.top * 1.5) / 2;
                let nCenterX = X + nWidth / 2;
                let nCenterY = Y + nHeight / 2;

                // set the position of the top-left corner of the rhombus
                let x = nCenterX;
                let y = nCenterY - nDiamondWidth / 2;

                // create a path for the rhombus
                oGraphicsPDF.BeginPath();
                oGraphicsPDF.MoveTo(x, y);
                oGraphicsPDF.LineTo(x + nDiamondWidth/2, y + nDiamondWidth/2);
                oGraphicsPDF.LineTo(x, y + nDiamondWidth);
                oGraphicsPDF.LineTo(x - nDiamondWidth/2, y + nDiamondWidth/2);
                oGraphicsPDF.ClosePath();

                oGraphicsPDF.Fill();
                break;
            }
                
            case CHECKBOX_STYLES.square: {
                let nDelta = Math.abs(nHeight - nWidth);
                let nMaxW = Math.min(nWidth, nHeight) * 0.8 - oMargins.bottom * 2;

                let x = (nWidth > nHeight ? X + nDelta / 2 : X) + oMargins.bottom + Math.min(nWidth, nHeight) * 0.1;
                let y = (nHeight > nWidth ? Y + nDelta / 2 : Y) + oMargins.bottom + Math.min(nWidth, nHeight) * 0.1;

                oGraphicsPDF.BeginPath();
                oGraphicsPDF.Rect(x, y, nMaxW, nMaxW);
                oGraphicsPDF.Fill();
                break;
            }
                
            case CHECKBOX_STYLES.star: {
                // set the position of the center of the star
                let nCenterX = X + nWidth / 2;
                let nCenterY = Y + nHeight / 2;

                // set the outer and inner radius of the star
                let outerRadius = Math.min(nWidth, nHeight) / 2 - oMargins.bottom - Math.min(nWidth, nHeight) / 20;
                let innerRadius = outerRadius / 2.5;

                // set the number of points of the star
                let numPoints = 5;

                // create a path for the star
                oGraphicsPDF.BeginPath();
                for (let i = 0; i < numPoints * 2; i++) {
                    let radius = i % 2 === 0 ? outerRadius : innerRadius;
                    let angle = Math.PI / numPoints * i;
                    let pointX = nCenterX + radius * Math.sin(angle);
                    let pointY = nCenterY - radius * Math.cos(angle);
                    if (i === 0) {
                    oGraphicsPDF.MoveTo(pointX, pointY);
                    } else {
                    oGraphicsPDF.LineTo(pointX, pointY);
                    }
                }
                oGraphicsPDF.ClosePath();

                // fill the star with a color
                oGraphicsPDF.Fill();
                break;
            }

            case CHECKBOX_STYLES.check: {
                let imgW = CHECKED_ICON.width;
                let imgH = CHECKED_ICON.height;

                let nInsideW = nWidth - 2 * oMargins.bottom;
                let nInsideH = nHeight - 2 * oMargins.bottom;

                let nGrScale = oGraphicsPDF.GetScale();
                let nScale = Math.min((nInsideW - nInsideW * 0.2) / imgW, (nInsideH - nInsideW * 0.2) / imgH);

                let wScaled = Math.max(imgW * nScale, 1);
                let hScaled = Math.max(imgH * nScale, 1);

                let x = X + oMargins.bottom + (nInsideW - wScaled)/2;
                let y = Y + oMargins.bottom + (nInsideH - hScaled)/2;

                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');

                // Set the canvas dimensions to match the image
                canvas.width = wScaled * nGrScale >> 0;
                canvas.height = hScaled * nGrScale >> 0;

                // Draw the image onto the canvas
                context.drawImage(CHECKED_ICON, 0, 0, imgW, imgH, 0, 0, canvas.width, canvas.height);
                context.globalCompositeOperation = "source-atop";
                context.fillStyle = "rgb(" + oRGB.r + "," + oRGB.g + "," + oRGB.b + ")";
                context.fillRect(0, 0, canvas.width, canvas.height);

                oGraphicsPDF.SetIntegerGrid(true);
                oGraphicsPDF.DrawImageXY(canvas, x, y);
                oGraphicsPDF.SetIntegerGrid(false);
            }
        }
    };

    // /**
    //  * Corrects the positions of symbol.
    //  * @memberof CBaseCheckBoxField
    //  * @typeofeditors ["PDF"]
    //  */
    // CBaseCheckBoxField.prototype.Internal_CorrectContent = function() {
    //     let oPara = this.content.GetElement(0);

    //     this.content.Recalculate_Page(0, true);

    //     // подгоняем размер галочки
    //     let nCharH = this.ProcessAutoFitContent();
        
    //     let oRect = this.getFormRelRect();

    //     oPara.Pr.Spacing.Before = (oRect.H - nCharH) / 2;
    //     oPara.CompiledPr.NeedRecalc = true;
    // };

    // CBaseCheckBoxField.prototype.ProcessAutoFitContent = function() {
    //     let oPara   = this.content.GetElement(0);
    //     let oRun    = oPara.GetElement(0);
    //     let oTextPr = oRun.Get_CompiledPr(true);
    //     let oBounds = this.getFormRelRect();

    //     g_oTextMeasurer.SetTextPr(oTextPr, null);
    //     g_oTextMeasurer.SetFontSlot(AscWord.fontslot_ASCII);

    //     var nTextHeight = g_oTextMeasurer.GetHeight();
    //     var nMaxWidth   = oPara.RecalculateMinMaxContentWidth(false).Max;
    //     var nFontSize   = oTextPr.FontSize;

    //     if (nMaxWidth < 0.001 || nTextHeight < 0.001 || oBounds.W < 0.001 || oBounds.H < 0.001)
    // 	    return nTextHeight;

    //     var nNewFontSize = nFontSize;

    //     nNewFontSize = (oBounds.H / g_dKoef_pt_to_mm) >> 0;
    //     oRun.SetFontSize(nNewFontSize);

    //     oTextPr.FontSize    = nNewFontSize;
    //     oTextPr.FontSizeCS  = nNewFontSize;

    //     g_oTextMeasurer.SetTextPr(oTextPr, null);
    //     g_oTextMeasurer.SetFontSlot(AscWord.fontslot_ASCII);

    //     return g_oTextMeasurer.GetHeight();
    // };
    /**
     * Returns a canvas with origin view (from appearance stream) of current form.
     * @memberof CBaseCheckBoxField
     * @param {boolean} isChecked - wheter to retuns view when checkbox is checked
     * @typeofeditors ["PDF"]
     * @returns {canvas}
     */
    CBaseCheckBoxField.prototype.GetOriginView = function(nAPType, isChecked) {
        if (this._apIdx == -1)
            return null;

        let oViewer = editor.getDocumentRenderer();
        let oFile   = oViewer.file;
        
        let oApearanceInfo  = this.GetOriginViewInfo();

        let canvas  = document.createElement("canvas");
        let nWidth  = oApearanceInfo["w"];
        let nHeight = oApearanceInfo["h"];
        
        canvas.width    = nWidth;
        canvas.height   = nHeight;

        canvas.x    = oApearanceInfo["x"];
        canvas.y    = oApearanceInfo["y"];
        
        let nRetValue, oApInfoTmp;

        switch (nAPType) {
            case AscPDF.APPEARANCE_TYPE.normal:
                oApInfoTmp = oApearanceInfo["N"];
                break;
            case AscPDF.APPEARANCE_TYPE.rollover:
                oApInfoTmp = oApearanceInfo["R"] ? oApearanceInfo["R"] : oApearanceInfo["N"];
                break;
            case AscPDF.APPEARANCE_TYPE.mouseDown:
                oApInfoTmp = oApearanceInfo["D"] ? oApearanceInfo["D"] : oApearanceInfo["N"];
                break;
            default:
                oApInfoTmp = oApearanceInfo["N"];
                break;
        }

        nRetValue = isChecked ? oApInfoTmp["Yes"]["retValue"] : oApInfoTmp["Off"]["retValue"];

        let supportImageDataConstructor = (AscCommon.AscBrowser.isIE && !AscCommon.AscBrowser.isIeEdge) ? false : true;

        let ctx             = canvas.getContext("2d");
        let mappedBuffer    = new Uint8ClampedArray(oFile.memory().buffer, nRetValue, 4 * nWidth * nHeight);
        let imageData       = null;

        if (supportImageDataConstructor)
        {
            imageData = new ImageData(mappedBuffer, nWidth, nHeight);
        }
        else
        {
            imageData = ctx.createImageData(nWidth, nHeight);
            imageData.data.set(mappedBuffer, 0);                    
        }
        if (ctx)
            ctx.putImageData(imageData, 0, 0);
        
        oViewer.file.free(nRetValue);

        return canvas;
    };
    CBaseCheckBoxField.prototype.onMouseDown = function() {
        let oDoc = this.GetDocument();
        this.DrawPressed();
                
        let bHighlight = this.IsNeedDrawHighlight();
        this.SetDrawHighlight(false);

        if (bHighlight)
            this.AddToRedraw();

        this.AddActionsToQueue(AscPDF.FORMS_TRIGGERS_TYPES.MouseDown);
        if (oDoc.activeForm != this)
            this.AddActionsToQueue(AscPDF.FORMS_TRIGGERS_TYPES.OnFocus);
        oDoc.activeForm = this;
    };
    CBaseCheckBoxField.prototype.onMouseEnter = function() {
        this.AddActionsToQueue(AscPDF.FORMS_TRIGGERS_TYPES.MouseEnter);

        this.SetHovered(true);
    };
    CBaseCheckBoxField.prototype.onMouseExit = function() {
        this.AddActionsToQueue(AscPDF.FORMS_TRIGGERS_TYPES.MouseExit);

        this.SetHovered(false);
    };
    CBaseCheckBoxField.prototype.DrawPressed = function() {
        this.SetPressed(true);
        editor.getDocumentRenderer()._paint();
    };
    CBaseCheckBoxField.prototype.DrawUnpressed = function() {
        this.SetPressed(false);
        editor.getDocumentRenderer()._paint();
    };
    CBaseCheckBoxField.prototype.onMouseUp = function() {
        this.CreateNewHistoryPoint();
        if (this.IsChecked()) {
            if (this._noToggleToOff == false) {
                this.SetChecked(false);
                this.SetApiValue("Off");
            }
        }
        else {
            this.SetChecked(true);
            this.SetApiValue(this.GetExportValue());
        }
        
        this.DrawUnpressed();

        if (AscCommon.History.Is_LastPointEmpty())
            AscCommon.History.Remove_LastPoint();
        else {
            this.SetNeedCommit(true);
            this.Commit2();
        }

        let oOverlay        = editor.getDocumentRenderer().overlay;
        oOverlay.max_x      = 0;
        oOverlay.max_y      = 0;
        oOverlay.ClearAll   = true;

        editor.getDocumentRenderer().onUpdateOverlay();
    };
    CBaseCheckBoxField.prototype.SetExportValue = function(sValue) {
        this._exportValue = sValue;
    };
    CBaseCheckBoxField.prototype.GetExportValue = function() {
        return this._exportValue;
    };
    CBaseCheckBoxField.prototype.SetNoToggleToOff = function(bValue) {
        this._noToggleToOff = bValue;
    };
    CBaseCheckBoxField.prototype.IsNoToggleToOff = function() {
        return this._noToggleToOff;
    };
    /**
     * Sets the checkbox style
     * @memberof CBaseCheckBoxField
     * @param {number} nType - checkbox style type (CHECKBOX_STYLES)
     * @typeofeditors ["PDF"]
     */
    CBaseCheckBoxField.prototype.SetStyle = function(nType) {
        this._chStyle = nType;
    };
    CBaseCheckBoxField.prototype.SetValue = function(sValue) {
        if (this._exportValue == sValue)
            this.SetChecked(true);
        else
            this.SetChecked(false);
        
        if (editor.getDocumentRenderer().IsOpenFormsInProgress && this.GetParent() == null)
            this.SetApiValue(sValue);
    };
    CBaseCheckBoxField.prototype.GetValue = function() {
        return this.IsChecked() ? this._exportValue : "Off";
    };
    CBaseCheckBoxField.prototype.SetDrawFromStream = function() {
    };

    /**
     * Set checked to this field (not for all with the same name).
     * @memberof CBaseCheckBoxField
     * @typeofeditors ["PDF"]
     */
    CBaseCheckBoxField.prototype.SetChecked = function(bChecked) {
        if (bChecked == this.IsChecked())
            return;

        this.AddToRedraw();

        if (bChecked) {
            !editor.getDocumentRenderer().isOnUndoRedo && AscCommon.History.Add(new CChangesPDFFormValue(this, this.GetValue(), this._exportValue));
            this._checked = true;
        }
        else {
            !editor.getDocumentRenderer().isOnUndoRedo && AscCommon.History.Add(new CChangesPDFFormValue(this, this.GetValue(), "Off"));
            this._checked = false;
        }
    };

    if (!window["AscPDF"])
	    window["AscPDF"] = {};
    
    let CHECK_SVG = "<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>\
    <path d='M5.2381 8.8L4 11.8L7.71429 16C12.0476 9.4 13.2857 8.2 17 4C14.5238 4 9.77778 8.8 7.71429 11.8L5.2381 8.8Z' fill='black'/>\
    </svg>";

    function toBase64(str) {
		return window.btoa(unescape(encodeURIComponent(str)));
	}
	
	function getSvgImage(svg) {
		let image = new Image();
		if (!AscCommon.AscBrowser.isIE || AscCommon.AscBrowser.isIeEdge) {
			image.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
		}
		else {
			image.src = "data:image/svg+xml;base64," + toBase64(svg);
			image.onload = function() {
				// Почему-то IE не определяет размеры сам
				this.width = 20;
				this.height = 20;
			};
		}
		
		return image;
	}

    const CHECKED_ICON = getSvgImage(CHECK_SVG);

	window["AscPDF"].CBaseCheckBoxField = CBaseCheckBoxField;
	window["AscPDF"].CHECKBOX_STYLES = CHECKBOX_STYLES;
})();

