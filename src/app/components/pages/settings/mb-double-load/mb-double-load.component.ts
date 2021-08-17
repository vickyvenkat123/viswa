import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BaseComponent } from '../../../../features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { setCurrency, setCurrencyDecimalFormat, setCurrencyFormat, setCurrencyDecimalFormatNew } from 'src/app/services/constants';
import { NetworkService } from 'src/app/services/network.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { isArray } from '@amcharts/amcharts4/core';

@Component({
  selector: 'app-mb-double-load-page',
  templateUrl: './mb-double-load.component.html',
  styleUrls: ['./mb-double-load.component.scss'],
})
export class MBDoubleLoadComponent extends BaseComponent implements OnInit {
  isLoggedIn: boolean = false;
  loadNo: any;
  itemList: ItemModel[] = [];
  updated: any;
  public creditNoteForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private cts: CommonToasterService,
  ) {
    super('Organization');
  }

  ngOnInit(): void {
    this.creditNoteForm = this.formBuilder.group({
      items: new FormArray([]),
    });
  }
  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.creditNoteForm.get('items') as FormArray;

    return itemControls.controls;
  }
  getRequest() {
    this.itemList = [];
    let url = `http://172.16.0.143:8000/sap/opu/odata/sap/ZGETMIGO_DETAILS_SRV/GetdetailsSet?sap-client=400&$filter=LoadNo%20eq%20%27${this.loadNo}%27`;
    this.http
      .get(url, { responseType: 'text' }).subscribe(res => {
        console.log("res", res);
        console.log(this.xml2json(res, '  '));
        var obj = JSON.parse(this.xml2json(res, '  '));

        if (obj['feed']) {
          var feed = obj["feed"];
          if (feed["updated"]) {
            this.updated = feed["updated"];
          }
          var entries = feed["entry"];
          if (entries)
            if (isArray(entries)) {
              for (var entry of entries) {
                var content = entry["content"];
                if (content) {
                  var property = content["m:properties"];
                  var itemModel: ItemModel = {
                    LoadNo: property["d:LoadNo"],
                    Material: property["d:Material"],
                    MaterialDescription: property["d:MaterialDescription"],
                    Quantity: property["d:Quantity"],
                    Uom: property["d:Uom"],
                  }
                  this.itemList.push(itemModel);
                }

              }
            }
        }

        if (this.itemList.length > 0) {
          const itemControls = this.creditNoteForm.get('items') as FormArray;
          for (var item of this.itemList) {
            itemControls.push(
              this.formBuilder.group({
                flag: new FormControl(false),
                quantity: new FormControl(Number(item.Quantity)),
                material: new FormControl((item.Material)),
                materialDescription: new FormControl((item.MaterialDescription)),
                Uom: new FormControl((item.Uom)),
                LoadNo: new FormControl((item.LoadNo)),
              })
            );
          }
        }

      });;
    // this.networkService.getAll().subscribe(res => {
    //   console.log("res", res);
    // });
  }

  errorHandler(error: HttpErrorResponse) {
    return observableThrowError(error.error || 'Server Error');
  }

  parseXml = function (xmlStr) {
    return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
  };

  submitItemDetail() {
    var form = this.creditNoteForm.getRawValue();
    console.log("form", form);
    var body = {
      "d": {
        "LoadNo": this.loadNo,
        "UserId": "VAN1",
        "SetdetailsSet": []
      }
    };
    form.items.forEach(element => {
      var objele = {
        "LoadNo": this.loadNo,
        "Material": element.material,
        "MaterialDesc": element.materialDescription,
        "Quantity": element.quantity,
        "Uom": element.uom,
        "Flag": element.flag ? "X" : ""
      }
      body.d.SetdetailsSet.push(objele);
    });

    this.http
      .post("http://172.16.0.143:8000/sap/opu/odata/sap/ZGETMIGO_DETAILS_SRV/HeaderSet?sap-client=400", body).subscribe(res => {

      });
  }

  xml2json(xml, tab) {
    var X = {
      toObj: function (xml) {
        var o = {};
        if (xml.nodeType == 1) {   // element node ..
          if (xml.attributes.length)   // element with attributes  ..
            for (var i = 0; i < xml.attributes.length; i++)
              o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
          if (xml.firstChild) { // element has child nodes ..
            var textChild = 0, cdataChild = 0, hasElementChild = false;
            for (var n = xml.firstChild; n; n = n.nextSibling) {
              if (n.nodeType == 1) hasElementChild = true;
              else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
              else if (n.nodeType == 4) cdataChild++; // cdata section node
            }
            if (hasElementChild) {
              if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                X.removeWhite(xml);
                for (var n = xml.firstChild; n; n = n.nextSibling) {
                  if (n.nodeType == 3)  // text node
                    o["#text"] = X.escape(n.nodeValue);
                  else if (n.nodeType == 4)  // cdata node
                    o["#cdata"] = X.escape(n.nodeValue);
                  else if (o[n.nodeName]) {  // multiple occurence of element ..
                    if (o[n.nodeName] instanceof Array)
                      o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                    else
                      o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                  }
                  else  // first occurence of element..
                    o[n.nodeName] = X.toObj(n);
                }
              }
              else { // mixed content
                if (!xml.attributes.length)
                  o = X.escape(X.innerXml(xml));
                else
                  o["#text"] = X.escape(X.innerXml(xml));
              }
            }
            else if (textChild) { // pure text
              if (!xml.attributes.length)
                o = X.escape(X.innerXml(xml));
              else
                o["#text"] = X.escape(X.innerXml(xml));
            }
            else if (cdataChild) { // cdata
              if (cdataChild > 1)
                o = X.escape(X.innerXml(xml));
              else
                for (var n = xml.firstChild; n; n = n.nextSibling)
                  o["#cdata"] = X.escape(n.nodeValue);
            }
          }
          if (!xml.attributes.length && !xml.firstChild) o = null;
        }
        else if (xml.nodeType == 9) { // document.node
          o = X.toObj(xml.documentElement);
        }
        else
          alert("unhandled node type: " + xml.nodeType);
        return o;
      },
      toJson: function (o, name, ind) {
        var json = name ? ("\"" + name + "\"") : "";
        if (o instanceof Array) {
          for (var i = 0, n = o.length; i < n; i++)
            o[i] = X.toJson(o[i], "", ind + "\t");
          json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
        }
        else if (o == null)
          json += (name && ":") + "null";
        else if (typeof (o) == "object") {
          var arr = [];
          for (var m in o)
            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
          json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
        }
        else if (typeof (o) == "string")
          json += (name && ":") + "\"" + o.toString() + "\"";
        else
          json += (name && ":") + o.toString();
        return json;
      },
      innerXml: function (node) {
        var s = ""
        if ("innerHTML" in node)
          s = node.innerHTML;
        else {
          var asXml = function (n) {
            var s = "";
            if (n.nodeType == 1) {
              s += "<" + n.nodeName;
              for (var i = 0; i < n.attributes.length; i++)
                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
              if (n.firstChild) {
                s += ">";
                for (var c = n.firstChild; c; c = c.nextSibling)
                  s += asXml(c);
                s += "</" + n.nodeName + ">";
              }
              else
                s += "/>";
            }
            else if (n.nodeType == 3)
              s += n.nodeValue;
            else if (n.nodeType == 4)
              s += "<![CDATA[" + n.nodeValue + "]]>";
            return s;
          };
          for (var c = node.firstChild; c; c = c.nextSibling)
            s += asXml(c);
        }
        return s;
      },
      escape: function (txt) {
        return txt.replace(/[\\]/g, "\\\\")
          .replace(/[\"]/g, '\\"')
          .replace(/[\n]/g, '\\n')
          .replace(/[\r]/g, '\\r');
      },
      removeWhite: function (e) {
        e.normalize();
        for (var n = e.firstChild; n;) {
          if (n.nodeType == 3) {  // text node
            if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
              var nxt = n.nextSibling;
              e.removeChild(n);
              n = nxt;
            }
            else
              n = n.nextSibling;
          }
          else if (n.nodeType == 1) {  // element node
            X.removeWhite(n);
            n = n.nextSibling;
          }
          else                      // any other node
            n = n.nextSibling;
        }
        return e;
      }
    };
    xml = this.parseXml(xml);
    if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
  }
}

interface ItemModel {
  LoadNo: number,
  Material: string,
  MaterialDescription: string,
  Quantity: number,
  Uom: string,
}