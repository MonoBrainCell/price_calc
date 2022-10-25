// JavaScript Document
$(document).ready(function(){
	// Создаём объект класса калькулятора и передаём все опции
	let obj=new CostDeterminant(
		{
			totalElementSelector:"#total_summ",
			componentsSelector:".cost_component",
			currencyName:"руб.",
			elemValueAttr:"data-price",
			elemValueFactorAttr:"data-price-factor",
			elementsValueHandlers: {
				"input[type='number']":getFieldValue, 
				"input[type='checkbox']":getFlagValue,
				"input[type='radio']":getFlagValue,
				"select[name='site_type']":getSelectValue 
			},
			hintElementID:"current_price",
			compsEvents: {
				"input[type='checkbox'],input[type='radio']": {
					"change": handleFlagsChange 
				},
				"input[type='number']": {
					"focus": handleFieldFocus, 
					"keyup": handleInputToField, 
					"change": handleInputToField 
				},
				"[name='site_type']": {
					"change": handleSiteTypeChange 
				},
				"[name='support']": {
					"change": handleSupportTypeChange 
				},
				"select[name=discount]": {
					"change": handleDiscountChange 
				}
			},
			totalCostModifiers:[applyClientDiscount],
			eventsCalledImmediatly: [
				{'change':"input[type='number'],input[type='checkbox'],input[type='radio'],[name='support']"},
				{'change':"[name='site_type']"},
				{'change':"select[name=discount]"}
			]
		}
	);
	
	obj.switchOn(); // Включаем функционал калькулятора

	// Функция получения стоимости числовых полей калькулятора
	function getFieldValue(element,valueAttr,valueFactorAttr){
		// Создаём массив
		let values=[
			$(element).val(), // Первым элементом задаём текущее значение поля
			$(element).attr(valueFactorAttr) // Вторым элементом задаём значение атрибута поля, отвечающий за множитель стоимости
		];
		return obj.convertCompValue(values); // Возвращаем "стандартизированное" значение стоимости
	}

	// Функция получения стоимости флажков и радиопереключателей калькулятора
	function getFlagValue(element,valueAttr,valueFactorAttr){
		// Проверяем является ли текущий флажок/радиопереключатель выбранным
		if ($(element).is(":checked")===true){
			let values=[
				$(element).filter(":checked").attr(valueAttr),
				$(element).filter(":checked").attr(valueFactorAttr)
			];
			return obj.convertCompValue(values);
		}
		// Если флажок/радиопереключатель не был выбран, то возвращаем значение, характерное для нулевой стоимости
		else 
			return [0,1];
		
	}

	// Функция получения стоимости полей выбора значения(select)
	function getSelectValue(element,valueAttr,valueFactorAttr){
		let values=[
			$(element).find("option:selected").attr(valueAttr),
			$(element).find("option:selected").attr(valueFactorAttr)
		];
		
		return obj.convertCompValue(values);
	}

	// Функция-обработчик события изменения флажков/радиопереключателей
	function handleFlagsChange(){
		// Если флажок/радиопереключатель является выбранным, то
		if ($(this).is(":checked")===true){
			obj.showHint( $(this) ); // отображаем стоимость элемента
		}
		obj.displayTotalCost(); // Считаем и выводим итоговую стоимость
	}

	// Функция-обработчик события фокуса числового поля
	function handleFieldFocus(){
		obj.showHint( $(this) );
	}
	
	// Функция-обработчик события ввода с клавиатуры значения в числовое поле (также используется для обработки события изменения значения числового поля)
	function handleInputToField(){
		obj.showHint( $(this) );
		obj.displayTotalCost();
	}

	// Функция-обработчик события изменения значения select'а, отвечающего за тип сайта
	function handleSiteTypeChange() { 
		// Если были выбраны "визитка" или "обычный"
		if ($(this).val()=="visitcard" || $(this).val()=="standart"){
			$("#simple_site, #pages_quantity").slideDown(700); // Развернём блоки, относящиеся к формированию стоимости только для этих типов
		}
		// Если выбраны другие типы, то
		else 
			$("#simple_site, #pages_quantity").slideUp(700); // Сворачиваем блоки, относящиеся только к формированию стоимости типа "визитка" и "обычный"
		
		// Встраиваем в анимационную очередь подсчёт и вывод итоговой стоимости(реализуем это для того, чтобы итоговая стоимость отобразилась после окончания анимации сворачивания/разворачивания блоков)
		$("#simple_site, #pages_quantity").queue(function(){
			obj.displayTotalCost();
			$(this).dequeue();
		});
		obj.showHint( $(this) );
		
	}

	// Функция-обработчик события изменения значения select'а, отвечающего за услугу поддержки сайта
	function handleSupportTypeChange(){
		// Если текущее значение select'а, соответствует необходимости поддержки, то разворачиваем блок с выбором частоты поддержки
		if ($(this).val()=="yes")
			$("#support_true").slideDown(700);
		// Если текущее значение select'а, имеет какое-либо другое значение, то сворачиваем блок с выбором частоты поддержки
		else 
			$("#support_true").slideUp(700);
		
		$("#support_true").queue(function(){
			obj.displayTotalCost();
			$(this).dequeue();
		});
	}

	// Функция-обработчик события изменения значения элемента, отвечающего за скидку
	function handleDiscountChange(){
		obj.displayTotalCost();
	}

	// Функция, корректирующая итоговую стоимость(с учетом выбранной скидки)
	function applyClientDiscount(total){
		let discountCompSelector="select[name=discount]"; // Устанавливаем селектор элемента, значение которого отвечает за изменение итоговой стоимости
		let valueAttr=obj.getOpt("elemValueAttr"); // Пытаемся получить из опций имя атрибута, используемого для хранения стоимости текущего элемента
		
		// Если не удалось найти элемент скидки по селектору ИЛИ по какой-то причине не удалось получить имя атрибута стоимости, то возвращаем итоговую стоимость без изменения
		if($(discountCompSelector).length<1 || valueAttr===false)
			return total;
		
		// Получаем стоимость элемента(в данном случае она будет использована, как множитель для итоговой стоимости)
		let factor=$(discountCompSelector).find("option:selected").attr(valueAttr);
		
		// Если значение получить не удалось, то возвращаем итоговую стоимость без изменений
		if(factor==undefined)
			return total;
		
		factor*=1; // Приводим значение к числовому типу
		
		// Применяем множитель к итоговой стоимости и возвращаем новое значение
		total*=factor;
		return total;
	}

});