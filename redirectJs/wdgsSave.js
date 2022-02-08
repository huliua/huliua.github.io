define(function(require, exports, module) {
	var utils = require('utils');
	var bs = require('./wdgsBS');
	
	var glxm = require('./glxm');
	//当前页面最大添加数
	var maxIndex = 0;
	
	var self;
	var sfbt;
	//重复提交标识
    var checkSubmitFlg = true; 
	
	var viewConfig = {
		initialize : function(data,flag) {
			self = this;
			sfbt = flag;
			this.pushSubView([ glxm ]);
			/*self.setDate(e);*/
			var mode = WIS_EMAP_SERV.getModel(bs.api.pageModel,
					'V_GS_WDGS_QUERY', 'form');
			
			var fid = 1;
			if('N' == sfbt){
				var RQ = PUB.getNowFormatDate();
			}else{
				var RQ = "";
			}
			
			alert("修改成功！");

			//获取当前登陆人当天的数据
			var gsData = WIS_EMAP_SERV.getData(bs.api.pageModel, 'T_GS_YGGS_ZB_QUERY',{YGBH: userId, RQ: RQ});
			if(gsData.totalSize > 0){
				fid = gsData.rows[0].WID;
			}
			
			if(data != null && data != ""){
				$("#emapForm").emapForm({
					root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
					data : mode,
					model : 'h',
					readonly : true
				});
				RQ = data.RQ;
				fid = data.WID;
				
				$("#title").show();
			}else{
				$("#emapForm").emapForm({
					root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
					data : mode,
					model : 'h'
				});
			}
			
			$("#emapForm").emapForm("setValue",{
				RQ : RQ,
				WID : fid
			});
			
			$('[data-name=RQ]').width(200);
			
			self.loadXmgs(fid);
			
			$('div[data-name="RQ"]').on("change", function(event) {
				var formData = $("#emapForm").emapForm("getValue");
				
				if(RQ != formData.RQ){
					//获取选择日期数据，有则提示是否合并，无则直接带入当前页面数据
					var gsData = WIS_EMAP_SERV.getData(bs.api.pageModel, 'V_GS_MYGS_QUERY',{YGBH: userId, RQ: formData.RQ});
					
					if(gsData.totalSize > 0 && gsData.rows[0].ZT == 1){
						PUB.warningTip("选择日期日报已审核通过，不可切换！");
						$("#emapForm").emapForm("setValue",{
							RQ : RQ
						});
					}else{
						RQ = formData.RQ;
						if(gsData.totalSize > 0){
							fid = gsData.rows[0].WID;
						}else{
							fid = 1;
						}
						
						$("#emapForm").emapForm("setValue",{WID : fid});
						
						//当前页面数据
						var gsArray = new Array();
						for (var i = 0; i <= $(".xmgs").length; i++) {
							if($("#xmgs" + i).length > 0){
								var xmgsData = $("#xmgs" + i).emapForm("getValue");
								var gs = {};
								
								gs.GLXM = xmgsData.GLXM;
								gs.FID = xmgsData.WID;
								gs.XMBH = xmgsData.XMBH;
								gs.XMMC = xmgsData.XMMC;
								gs.RWBH = xmgsData.RWBH;
								gs.RWMC = xmgsData.RWMC;
								gs.SHZT = xmgsData.SHZT;
								gs.GS = xmgsData.GS;
								gs.NR = xmgsData.NR;
								gs.GSXMBH = xmgsData.GSXMBH ;
								gs.XMJL   = xmgsData.XMJL;
								gs.YWX    = xmgsData.YWX;
								gs.CP     = xmgsData.CP;
								
								if(gs.GLXM != '' || gs.GS != '' || gs.NR != '') {
									gsArray.push(gs);
								}
							}
						}
						
						self.loadXmgs(fid, gsArray);
					}
				}
			});
			
			$("#btnDiv").show(); 
			$("#save").show(); 
			
			//工程人员满足条件才显示自动填充按钮
/*			BH_UTILS.doAjax('../api/isGcNotdzkf.do', {
				yggh : userId
			}).done(function(data) {
				if(data == true){*/
					$("#auto").show(); 
					
					//自动填充工程小助手问题
					$("#auto").click(function(){
						var formData = $("#emapForm").emapForm("getValue");
						var xmgs = $(".xmgs");
						var xmgsData = $("#xmgs0").emapForm("getValue");
						if (xmgs.length > 0 && xmgsData.GLXM != '') {
							BH_UTILS.bhDialogWarning({
								title:'确认',
								content:'已填写日报，确认将覆盖当前日报，是否继续？',
								buttons:[
									{
										text:'是',
										callback:function(){
											var gcData = WIS_EMAP_SERV.getData(bs.api.pageModel, 'V_GS_AUTO_GCXZSWT_QUERY',{ YGBH: userId,RQ: formData.RQ });
											if(gcData.totalSize > 0){
												var gsArray = new Array();
												for (var i = 0; i < gcData.totalSize; i++) {
													var xmgsData = gcData.rows[i];
													var gs = {};
													
													gs.GLXM = xmgsData.NR;
													gs.XMBH = xmgsData.XMBH;
													gs.XMMC = xmgsData.XMMC;
													gs.RWBH = xmgsData.RWBH;
													gs.RWMC = xmgsData.RWMC;
													gs.GS = xmgsData.GS;
													gs.NR = xmgsData.RBNR;
													gs.GSXMBH = xmgsData.GSXMBH ;
													gs.XMJL   = xmgsData.XMJL;
													gs.YWX    = xmgsData.YWX;
													gs.CP     = xmgsData.CP;
													
													gsArray.push(gs);
												}
												
												self.loadXmgs('1', gsArray);
											}
										}
									},
									{
										text:'否',
										callback:function(){
											return;
										}
									}
								]
							});
						}else{
							var gcData = WIS_EMAP_SERV.getData(bs.api.pageModel, 'V_GS_AUTO_GCXZSWT_QUERY',{ YGBH: userId,RQ: formData.RQ });
							if(gcData.totalSize > 0){
								var gsArray = new Array();
								for (var i = 0; i < gcData.totalSize; i++) {
									var xmgsData = gcData.rows[i];
									var gs = {};
									
									gs.GLXM = xmgsData.NR;
									gs.XMBH = xmgsData.XMBH;
									gs.XMMC = xmgsData.XMMC;
									gs.RWBH = xmgsData.RWBH;
									gs.RWMC = xmgsData.RWMC;
									gs.GS = xmgsData.GS;
									gs.NR = xmgsData.RBNR;
									gs.GSXMBH = xmgsData.GSXMBH ;
									gs.XMJL   = xmgsData.XMJL;
									gs.YWX    = xmgsData.YWX;
									gs.CP     = xmgsData.CP;
									
									gsArray.push(gs);
								}
								
								self.loadXmgs('1', gsArray);
							}
						}
					});
		//		}
		//	});
			
			this.eventMap = {
				'[data-action=save]' : this.save,
				'div[data-name=RQ]' : this.setDate,
				'[data-action=addGs]' : this.addGs,
				'[data-name=GLXM]' : this.glxm,
			};
		},
		
		//加载项目工时
		loadXmgs : function(fid, gsArray) {
			var xmgsMode = WIS_EMAP_SERV.getModel(bs.api.pageModel, 'V_GS_XMGS_QUERY', 'form');
			var xmgsData = WIS_EMAP_SERV.getData(bs.api.pageModel, 'V_GS_XMGS_QUERY',{FID: fid});
			if(xmgsData.totalSize > 0){
				$("#xmgsDiv").empty();
				for (var i = 0; i < xmgsData.totalSize; i++) {
					var shzt = xmgsData.rows[i].SHZT;
					var str = "";
					if(shzt == 1){
						str = "display:none";
					}
					$("#xmgsDiv").append("<div id='gsDiv" + i + "'><div style='width:50%;'><div style='float: right;margin-right: 20px;'>" +
							"<a href='javascript:void(0)' data-action='addGs'>添加</a>" +
							"<a href='javascript:void(0)' onclick='delGs(" + i + ")' style='margin-left: 20px;" + str + "'>删除</a></div></div>" +
							"<div id='xmgs" + i + "' class='xmgs'></div></div>");
					
					$("#xmgs" + i).emapForm({
						root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
						data : xmgsMode,
						model : 'h'
					});
					$("#xmgs" + i).emapForm("setValue", xmgsData.rows[i]);
					
					$("[data-name='GLXM']").attr({ readonly: 'true' });
					if(shzt == 1){
						$("#xmgs" + i).click(function(){
							PUB.warningTip("该项目工时已审，不可编辑！");
						});
						$("#xmgs" + i + " [data-name='GLXM']").attr({ disabled: 'true' });
						$("#xmgs" + i + " [data-name='GS']").attr({ disabled: 'true' });
						$("#xmgs" + i + " textarea").attr({ disabled: 'true' });
					}
					maxIndex++;
				}
				$("#MAXINDEX").val(maxIndex);
			}else{
				$("#xmgsDiv").empty();
				$("#xmgsDiv").append("<div id='gsDiv0'><div style='width:50%;display:block'><div style='float: right;margin-right: 20px;'>" +
						"<a href='javascript:void(0)' data-action='addGs'>添加</a>" +
						"<a href='javascript:void(0)' onclick='delGs(0)' style='margin-left: 20px;'>删除</a></div></div>" +
						"<div id='xmgs0' class='xmgs'></div></div>");
				
				$("#xmgs0").emapForm({
					root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
					data : xmgsMode,
					model : 'h'
				});
				
				$("[data-name='GLXM']").attr({ readonly: 'true' });
			}
			
			if(gsArray != undefined){
				if(xmgsData.totalSize > 0 && gsArray.length > 0){
					BH_UTILS.bhDialogWarning({
						title:'确认',
						content:'所选日期已填写日报，是否合并？',
						buttons:[
							{
								text:'是',
								callback:function(){
//									return;
									var gsIndex = xmgsData.totalSize;
									for (var j = 0; j < gsArray.length; j++) {
										$("#xmgsDiv").append("<div id='gsDiv" + gsIndex + "'><div style='width:50%;'><div style='float: right;margin-right: 20px;'>" +
												"<a href='javascript:void(0)' data-action='addGs'>添加</a>" +
												"<a href='javascript:void(0)' onclick='delGs(" + gsIndex + ")' style='margin-left: 20px;'>删除</a></div></div>" +
												"<div id='xmgs" + gsIndex + "' class='xmgs'></div></div>");
										
										$("#xmgs" + gsIndex).emapForm({
											root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
											data : xmgsMode,
											model : 'h'
										});
										$("#xmgs" + gsIndex).emapForm("setValue", gsArray[j]);
										
										$("[data-name='GLXM']").attr({ readonly: 'true' });
										
										gsIndex++;
									}
								}
							},
							{
								text:'否',
								callback:function(){
									if(xmgsData.totalSize == 0){
										$("#xmgsDiv").empty();
										$("#xmgsDiv").append("<div id='gsDiv0'><div style='width:50%;display:block'><div style='float: right;margin-right: 20px;'>" +
												"<a href='javascript:void(0)' data-action='addGs'>添加</a>" +
												"<a href='javascript:void(0)' onclick='delGs(0)' style='margin-left: 20px;'>删除</a></div></div>" +
												"<div id='xmgs0' class='xmgs'></div></div>");
										
										$("#xmgs0").emapForm({
											root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
											data : xmgsMode,
											model : 'h'
										});
										
										$("[data-name='GLXM']").attr({ readonly: 'true' });
									}
								}
							}
						]
					});
				}else{
					if(gsArray.length > 0){
						$("#xmgsDiv").empty();
						var gsIndex = xmgsData.totalSize;
						if(gsIndex == -1){
							gsIndex = 0;
						}
						for (var j = 0; j < gsArray.length; j++) {
							$("#xmgsDiv").append("<div id='gsDiv" + gsIndex + "'><div style='width:50%;'><div style='float: right;margin-right: 20px;'>" +
									"<a href='javascript:void(0)' data-action='addGs'>添加</a>" +
									"<a href='javascript:void(0)' onclick='delGs(" + gsIndex + ")' style='margin-left: 20px;'>删除</a></div></div>" +
									"<div id='xmgs" + gsIndex + "' class='xmgs'></div></div>");
							
							$("#xmgs" + gsIndex).emapForm({
								root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
								data : xmgsMode,
								model : 'h'
							});
							$("#xmgs" + gsIndex).emapForm("setValue", gsArray[j]);
							
							$("[data-name='GLXM']").attr({ readonly: 'true' });
							
							gsIndex++;
							maxIndex++;
						}
						$("#MAXINDEX").val(maxIndex);
					}
				}
			}
		},
		
		//重新加载列表页提示
		refreshTs : function() {
			var gstsData = WIS_EMAP_SERV.getData(bs.api.pageModel, 'hqgsts',{ YGBH: userId });
			if(gstsData.totalSize > 0){
				$("#gsts").html(gstsData.rows[0].NR);
			}
		},
		
		setDate : function(e) {	
			if('N' == sfbt){
//		    	$(e.currentTarget).bhDateTimePicker('minDate', PUB.MONDAY());
				//1-2号展示当前日期之前及上月的，3号及之后展示本月当前日期前(取配置)KTRQ
				var date = new Date();
				var day = date.getDate();
				
				var month = date.getMonth() + 1;
				
				var ktrq = 3;//默认3号，不包含3号，5,10月默认为10号
				
				if(month == 5 || month == 10){
					ktrq = 10;
				}else{
					var pzData = WIS_EMAP_SERV.getData(bs.api.pageModel,
							'T_JCFW_FLAG_QUERY', {
								ID : "KTRQ"
							});
					
					if(pzData.totalSize > 0){
						var ktrqData = pzData.rows[0];
						if(ktrqData != null){
							ktrq = ktrqData.FLAG;
						}
					}
				}
				
				
		    	$(e.currentTarget).bhDateTimePicker('maxDate', new Date());
		    	
			}else{
				
				var date = new Date();
				date.setDate(1);
				var minDay = date.getFullYear() -1 + "-01-01";
				
				
				var fullYear = date.getFullYear();
				var month = date.getMonth(); // getMonth 方法返回 0-11，代表1-12月
				if (month >= 1 && month <= 9) {
					month = "0" + month;
				}
				var endOfMonth = new Date(fullYear, month, 0).getDate(); // 获取最后一天
				date.setDate(endOfMonth);
				var maxDay = date.getFullYear() + "-" + month + "-" + date.getDate();
				
				//var maxDay = date.getFullYear() + "-" + date.getMonth()  + "-01";
				
				$(e.currentTarget).bhDateTimePicker('minDate', minDay);
		    	$(e.currentTarget).bhDateTimePicker('maxDate', maxDay);
		    	
			}

			
	    },
		
		save : function() {
			$.ajaxSetup({
				async : false
			});

			//如果没有添加按钮，则说明已经全部审核通过，点击提交时提醒
			if($("[data-action=addGs]").is(':hidden')){
				PUB.warningTip("当前日期工时已审核通过，不可提交！");
				return;
			}
			
			var newData = {};
			var formData = $("#emapForm").emapForm("getValue");
			
			var xmgs = $(".xmgs");
			
			if (xmgs.length == 0) {
				PUB.warningTip("请填写项目工时...");
				return;
			}
			//合计工时
			var totalGs = 0;
			
			var len = $(".xmgs").length;
			if(len > maxIndex){
				maxIndex = len;
			}
			
			var gsArray = new Array();
			for (var i = 0; i <= maxIndex; i++) {
				if($("#xmgs" + i).length > 0){
					var xmgsData = $("#xmgs" + i).emapForm("getValue");
					if($("#xmgs" + i).emapValidate('validate')){
						var gs = {};
						
						gs.fid = xmgsData.WID;
						gs.xmbh = xmgsData.XMBH;
						gs.xmmc = xmgsData.XMMC;
						gs.rwbh = xmgsData.RWBH;
						gs.rwmc = xmgsData.RWMC;
						gs.shzt = xmgsData.SHZT;
						gs.gs = xmgsData.GS;
						gs.nr = xmgsData.NR;
						gs.GSXMBH = xmgsData.GSXMBH ;
						gs.XMJL   = xmgsData.XMJL;
						gs.YWX    = xmgsData.YWX;
						gs.CP     = xmgsData.CP;
						
						totalGs += xmgsData.GS*1;
						
						gsArray.push(gs);
					}else{
						return;
					}
				}
			}
			
			var WID = formData.WID;
			if(WID == 1){
				WID = '';
			}
			
			newData.wid = WID;
			newData.rq = formData.RQ;
			newData.ygbh = userId;
			newData.ygxm = userName;
			newData.SJY = 'PC';
			if('N' == sfbt){
				newData.SFBT = 'N';
			}else{
				newData.SFBT = 'Y';
			}
			
			newData.xmGsList = gsArray;
			
			//截止当前时间可填工时
			var hour = PUB.getHours(new Date(PUB.getNowFormatDate() + " 09:00:00"), new Date());
			//上午：3小时，下午5小时，所以上午小于3则+1，下午不加1(午休1小时)
			if(hour < 3){
				hour += 1;
			}
			//不是当天的不判断
			if(totalGs > hour && PUB.getNowFormatDate() == formData.RQ){
				BH_UTILS.bhDialogWarning({
					title:'确认',
					content:'已填写合计工时与当前工作时长不符，请不要提前填写日报，是否继续提交？',
					buttons:[
						{
							text:'是',
							callback:function(){
								if(checkSubmitFlg){
									checkSubmitFlg = false;
									
	//								return;
									BH_UTILS.doAjax('../api/updateGs.do', {
										data : JSON.stringify(newData)
									}).done(function(data) {
										var status = data.status;
										var message = data.message;
										if(status == '500'){
											PUB.errorTip(message);
											checkSubmitFlg = true;
										}else{
											$.bhPaperPileDialog.hide({
												close : function() {
													PUB.successTip('保存成功');
													$('#emapdatatable').emapdatatable('reload');
													checkSubmitFlg = true;
													self.refreshTs();
													BH_UTILS.doAjax('../api/delGs.do');
												}
											});// 关闭当前弹窗
										}
									});
								}
							}
						},
						{
							text:'否',
							callback:function(){
								return;
							}
						}
					]
				});
			}else if(totalGs >= 16){
				BH_UTILS.bhDialogWarning({
					title:'确认',
					content:'今日工时过高，请注意拆分工时，是否继续提交？',
					buttons:[
						{
							text:'是',
							callback:function(){
								if(checkSubmitFlg){
									checkSubmitFlg = false;
									
	//								return;
									BH_UTILS.doAjax('../api/updateGs.do', {
										data : JSON.stringify(newData)
									}).done(function(data) {
										var status = data.status;
										var message = data.message;
										if(status == '500'){
											PUB.errorTip(message);
											checkSubmitFlg = true;
										}else{
											$.bhPaperPileDialog.hide({
												close : function() {
													PUB.successTip('保存成功');
													$('#emapdatatable').emapdatatable('reload');
													checkSubmitFlg = true;
													self.refreshTs();
													BH_UTILS.doAjax('../api/delGs.do');
												}
											});// 关闭当前弹窗
										}
									});
								}
							}
						},
						{
							text:'否',
							callback:function(){
								return;
							}
						}
					]
				});
			}else{
				if(checkSubmitFlg){
//					return;
					checkSubmitFlg = false;
					
					BH_UTILS.doAjax('../api/updateGs.do', {
						data : JSON.stringify(newData)
					}).done(function(data) {
						var status = data.status;
						var message = data.message;
						if(status == '500'){
							PUB.errorTip(message);
							checkSubmitFlg = true;
						}else{
							$.bhPaperPileDialog.hide({
								close : function() {
									PUB.successTip('保存成功');
									$('#emapdatatable').emapdatatable('reload');
									checkSubmitFlg = true;
									self.refreshTs();
									BH_UTILS.doAjax('../api/delGs.do');
								}
							});// 关闭当前弹窗
						}
					});
				}
			}
		},
		
		addGs : function() {
			maxIndex = $("#MAXINDEX").val()*1;
			//每次添加需要上个项目工时都填写完整
			for (var i = 0; i < maxIndex + 1; i++) {
				if($("#xmgs" + i).length != 0){
					if(!$("#xmgs" + i).emapValidate('validate')){
						PUB.warningTip("请先填写完整当前项目工时...");
						return;
					}
				}
			}
			
			$("#xmgsDiv").append("<div id='gsDiv" + maxIndex + "'><div style='width:50%'><div style='float: right;margin-right: 20px;'>" +
					"<a href='javascript:void(0)' data-action='addGs'>添加</a>" +
					"<a href='javascript:void(0)' onclick='delGs(" + maxIndex + ")' style='margin-left: 20px;'>删除</a></div></div>" +
					"<div id='xmgs" + maxIndex + "' class='xmgs'></div></div>");
			
			var xmgsMode = WIS_EMAP_SERV.getModel(bs.api.pageModel,
					'V_GS_XMGS_QUERY', 'form');
			
			$("#xmgs" + maxIndex).emapForm({
				root : WIS_EMAP_SERV.getContextPath(),// 附件上传时必备属性
				data : xmgsMode,
				model : 'h'
			});
			
			$("[data-name='GLXM']").attr({ readonly: 'true' });
			
			maxIndex += 1;
			$("#MAXINDEX").val(maxIndex);
			
			PUB.scrollBottom();
		},
		
		glxm : function(e) {
			var glxmTpl = utils.loadCompiledPage('glxm');

			$.bhPaperPileDialog.show({
				content : glxmTpl.render({}),
				title : "关联项目",
				ready : function($header, $body, $footer) {
					glxm.initialize(e);
				}
			});
		}

	};
	return viewConfig;
});

function delGs(i){
	var len = $(".xmgs").length;
	var addLen = $("[data-action='addGs']:visible").length;
	if(len == 1 || addLen == 1){
		PUB.warningTip("至少保留一个项目工时...");
		return;
	}else{
		//如果已填写内容则提示是否删除
		var GLXM = $("#gsDiv" + i + " [data-name='GLXM']").val();
		var GS = $("#gsDiv" + i + " [data-name='GS']").val();
		var NR = $("#gsDiv" + i + " [data-name='NR']").val();
		
		if(GLXM != '' || GS != '' || NR != ''){
			BH_UTILS.bhDialogWarning({
				title:'确认',
				content:'当前项目工时已填写内容，是否继续删除？',
				buttons:[
					{
						text:'是',
						callback:function(){
							$("#gsDiv" + i).remove();
						}
					},
					{
						text:'否',
						callback:function(){
							
						}
					}
				]
			});
		}else{
			$("#gsDiv" + i).remove();
		}
	}
}