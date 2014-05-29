angular.module('ngGrid', ['ui.bootstrap'])
.factory('gridService', ['$filter',function ($filter) {
	var factory={};
	var items=[];
	var filterItems=[];
	var pagedItems = [];
	var sortingOrder ='';
	var reverse = false;
	var filteredItems = [];
	var numPerPage = 10; //for pagination defines per page show items number ,don't change
	var queryType="all";
	
	var query='';
	factory.getGridObj=function(){
		var obj={
			columns:[],
			items:[],
			numPerPage : 10,
			filteredItems:[],
			pagedItems:[],
			sortingOrder:'',
			reverse:false,
			currentPage:0,
			hasDeleteItem:true,
			/*query:{
				string:'',
				type:'all',
			}*/
		}
		return obj;
	}
	/**
	 * [initGrid description]
	 * @param  {[object]} data [description] {items:[],sortingOrder:'user',reverse:false,query:''}
	 * @return {[type]}      [description]
	 */
	factory.initGrid=function(data){
		
		items=data.items;
		sortingOrder=data.sortingOrder;
		reverse=data.reverse;
		query=data.query;
		filteredItems=factory.search(query);
		
		return filteredItems;
	};
	var searchMatch = function(haystack, needle) {
			if(haystack==null){
				return false;
			}
			haystack=haystack.toString();
			if (needle.length<=0) {
				return true;
			}
			return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
			};
	/**
	 * [groupToPages description]
	 * @param  {[int]} num   [description] num per page
	 * @return {[type]}       [description]
	 */
	factory.groupToPages=function(num){
		numPerPage=num;
		pagedItems = [];
		for (var i = 0; i < filteredItems.length; i++) {

			if (i % num === 0) {
				pagedItems[Math.floor(i / num)] = [filteredItems[i]];
			} else {
				pagedItems[Math.floor(i / num)].push(filteredItems[i]);
			}
		}
		return pagedItems;
	}
	/**
	 * [search description]
	 * @param  {[array]} arrs [description] filter items
	 * @param  {[string]} query [description] filter string
	 * @return {[array]}       [description] filter array
	 */
	factory.search=function(query){
		
		var query=query || '';
		if(angular.isUndefined(query)){
			query='';
		}
		filteredItems = $filter('filter')(items, function(item) {

			if(queryType!='all'){
				
				if(searchMatch(item[queryType], query))
					return true;
			}else{
				//console.log(item);
				for (var attr in item) {
					
					if (searchMatch(item[attr], query))
						return true;
				}
			}
			
			return false;
		});
		// take care of the sorting order
		if (sortingOrder !== '') {
			
			filteredItems = $filter('orderBy')(filteredItems, sortingOrder, reverse);
		
		}

		return filteredItems;
	};
	/**
	 * [getSelectedList description] get selected checkbox array
	 * @param  {[array]} items [description] send all items to filter
	 * @return {[array]}       [description] filter array
	 */
	factory.getSelectedList=function(items){
	
		var selectedList = [];
			//delte selected
			selectedList = $filter('filter')(items, {
				checked: true
			});	
		return selectedList;
	};
	/**
	 * [getSelectedID description] get selected checkbox
	 * @param  {[array]} items     [description] send all items to filter
	 * @param  {[string]} itemIndex [description] get the item in filter array
	 * @return {[array]}           [description]
	 */
	factory.getSelectedID=function(items,itemIndex){
		
		var selectedList =factory. getSelectedList(items);
		var result = {
					id: []
				};

		angular.forEach(selectedList, function(val, key) {
			var id = val[itemIndex];
			result['id'].push(id);

		});

		return result;
	};
	/**
	 * [query description] user input search handler
	 * @param  {[string]} type [description] the column user wants search
	 * @param  {[string]} str  [description] the string user input
	 * @return {[type]}      [description]
	 */
	factory.query=function(type,str){
		query=str;
		queryType=type;
		factory.search(query);
	};
	factory.sort=function(index,desc){

		var sorted_css = {
			asc :'sorted ascending',
			desc :'sorted descending'
		}
		var obj = {
			items:'',
			reverse:false,
			css:'',
		}
		if(sortingOrder == index){
			if(desc){
				reverse=false;
				obj.css=sorted_css.asc;
			}else{
				reverse=true;
				obj.css=sorted_css.desc;
			}
		}else{
			reverse=false;
			obj.css=sorted_css.asc;
			sortingOrder = index;
		}

		obj.reverse = reverse;
		obj.items = factory.search(query);
		return obj;
	}
	factory.checkHandler=function(item,list){
		var result={
			checkAll:false,
			list:list,
		};

		if(angular.isDefined(item.item)){
			if(item.item.checked){
				var len=$filter('filter')(list,{checked:true}).length;
	
				if(len==list.length){
					result.checkAll=true;}		
			}
		}else{
			result.checkAll=item.checkAll;
			angular.forEach(list,function(val,key){
				val.checked=item.checkAll;
			});
			result.list=list;
		}

		return result;
	};

    /**
     * [clearSelectedHndlr description] for task function ,the limit task handle number is row num
     * @return {[type]} [description]
     */
    factory.clearSelectedHndlr=function(list){
    	var result=[];
    	angular.forEach(list,function(val,key){
    		val.checked=false;
    		result.push(val);
    	});
    	return result;
    };
    /**
     * [disableBtnHndlr description] 
     * @param  {[type]} lists [description]
     * @return {[type]}       [description]
     */
    factory.disableBtnHndlr=function(list){
    	var len=$filter('filter')(list,{checked:true}).length;
    	if(len>0){
    		return true;
    	}else{
    		return false;
    	}
    }

	return factory;
}]).controller('gridCtrl', ['$scope','$filter','gridService', function ($scope,$filter,gridService) {
	$scope.gridHeader=[
		{title: 'INDEX',index:'index'}, 
	    {title: 'ID',index:'id', sortable: true}, 
	    {title: 'USERNAME' ,index:'user', sortable: true,searchable:true},
	    {title: 'REGION',index:'region', sortable: true,searchable:true}
	];
	$scope.sortingOrder = 'index';
	$scope.reverse = false;
	$scope.filteredItems = [];
	$scope.numPerPage = 10;
	$scope.pagedItems = [];
	$scope.currentPage = 0;//currentpage
	$scope.uiCurrentPage = $scope.currentPage + 1;//page in ui
	$scope.searchColumns=$filter('filter')($scope.gridHeader,{searchable:true});
	$scope.searchColumns.splice(0,0,{title:'ALL',index:'all'});//search column
	$scope.query={
        type:$scope.searchColumns[0],
        string:'',
    };
	$scope.items = [
		{index:1,id:1,user:'testa',region:'us'},
		{index:2,id:2,user:'testb',region:'us'},
		{index:3,id:3,user:'testc',region:'us'},
		{index:4,id:4,user:'testd',region:'us'},
		{index:5,id:5,user:'teste',region:'us'},
		{index:6,id:6,user:'testf',region:'us'},
		{index:7,id:7,user:'testg',region:'us'},
		{index:8,id:8,user:'testh',region:'us'},
		{index:9,id:9,user:'testi',region:'us'},
		{index:10,id:10,user:'testj',region:'sv'},
		{index:11,id:11,user:'testk',region:'sv'},
		{index:12,id:12,user:'testl',region:'sv'},
		{index:13,id:13,user:'testm',region:'sv'},
		{index:14,id:14,user:'testn',region:'th'},
		{index:15,id:15,user:'test1o',region:'th'},
		{index:16,id:16,user:'test1p',region:'th'},
		{index:17,id:17,user:'test1q',region:'ja'},
		{index:18,id:18,user:'test1r',region:'ja'},
		{index:19,id:19,user:'test1s',region:'ja'},
	];
	var gridObj={
		items:$scope.items,
		sortingOrder:$scope.sortingOrder,
		reverse:$scope.reverse,
		query:''
	};
	
	
	$scope.changePage=function(page){		
		if($scope.hasDeleteItem){
			$scope.pagedItems[$scope.currentPage]=gridService.clearSelectedHndlr($scope.pagedItems[$scope.currentPage]);
		}
		$scope.hasDeleteItem=false;
		$scope.currentPage = page - 1;
	};
	$scope.filteredItems=gridService.initGrid(gridObj);
	$scope.pagedItems=gridService.groupToPages($scope.numPerPage);
	$scope.currentPage=0;

	$scope.search=function(){
     
        $scope.filteredItems=gridService.query($scope.query.type.index,$scope.query.string);
        $scope.pagedItems=gridService.groupToPages($scope.numPerPage);
        $scope.currentPage=0;
    };
    $scope.sort=function(){
	
		var index=this.column.index;
		if(this.column.sortable) {
			var result=gridService.sort(this.column.index,$scope.reverse);
			$scope.items=result.items;
			
			$scope.pagedItems=gridService.groupToPages($scope.numPerPage);
		
			$scope.currentPage=0;
		}
	}
}])