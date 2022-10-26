// JavaScript Document
/* * Введение

	- - - Общие принципы - - -
	
	> Поведения калькулятора стоимости зависит от пользователя, использующего калькулятор
	
	> Калькулятор является исполняющей оболочкой для переданных функций и обеспечивает их упорядоченный вызов в необходимый момент
	
	> Пользователь сам определяет функции, которые будут использоваться на ключевых этапах работы калькулятора
	
	> На данный момент пользователь может определить функции для следующих частей калькулятора:
		>> Функции,	отвечающие за получение значения элемента калькулятора стоимости с привязкой к селектору (elementsValueHandlers)
		>> Функции, отвечающие за обработку событий возникающих на элементах калькулятора стоимости с привязкой к селектору (compsEvents)
		>> Функции, отвечающие за корректировку вычисленной итоговой стоимости (например, применение скидки и т.п.)  (totalCostModifiers)
		
	> Калькулятор имеет определённый список опций(this._FIELDS_DISPOSITION), которые необходимы для его корректной работы. Для запуска функционала калькулятора должны быть установлены все опции из списка

	> Опции делятся на два типа; при этом от типа опции зависит то какие манипуляции можно проводить над ними
		>> "Неструктурированные" опции - опции, которые содержат примитивные типы данных(число, строка, булев и т.п.)
			>>> Можно осуществлять получение значения этой опции
			>>> Можно осуществлять изменение значения этой опции
		>> "Структурированные" опции - опции, которые содержат структурированные типы данных(объект, массив)
			>>> Можно осуществлять получение значения из этой опции
			>>> Можно осуществлять удаление значения из этой опции
			>>> Можно осуществлять изменение значения этой опции
			>>> Можно осуществлять добавление значения в эту опцию
	
	> Полный список опций
		>> "Неструктурированные":
			>>> totalElementSelector - селектор элемента, в котором будет демонстрироваться итоговая стоимость определённая калькулятором
			>>> componentsSelector - селектор, по которому будет определяться является ли элемент калькулятора учавствующим в формировании итоговой стоимости
			>>> currencyName - обозначение валюты, используемой в калькуляторе
			>>> elemValueAttr - название атрибута, в котором определена стоимость элемента калькулятора
			>>> elemValueFactorAttr - название атрибута, в котором определён множитель стоимости для значения элемента калькулятора
			>>> hintElementID - идентификатор элемента, демонстрирующего стоимость текущего элемента калькулятора
		>> "Структурированные":
			>>> elementsValueHandlers - функции, отвечающие за получение значения элемента калькулятора стоимости с привязкой к селектору. Структура:
				{
					"селектор":функция,
					...
				}
			>>> compsEvents - функции, отвечающие за обработку событий возникающих на элементах калькулятора стоимости с привязкой к селектору. Структура:
				{
					"селектор":
						{
							"событие":функция-обработчик,
							...
						},
					...
				}
			>>> totalCostModifiers - функции, отвечающие за корректировку вычисленной итоговой стоимости. Структура:
				[
					функция,
					...
				]
			>>> eventsCalledImmediatly - события и селекторы элементов для, которых они должны быть вызваны сразу после включения функционала калькулятора. Структура:
				[
					{
						"событие":"селектор"
					},
					...
				]
	
	> Для упрощения работы со сложными структурами "структурированных" опций используется методика определения пути к каждому отдельному конечному значению внутри опции
	
	> Для упорядоченности и безопасности работа с путями к значениям "структурированных" опций происходит во "внешних" методах не напрямую, а через реестр путей
	
	> В реестре путей сохраняются все пути к "структурированным" опциям, а также в него вносятся изменения в случае удаления значений из таких опций
	
	> Функция добавления значений в "структурированные" опции в случае успешного добавления значения возвращает указатель на новый путь в реестре (представляет из себя массив, всегда состоящий из 2-х значений)
	
	> Указатели реестра можно получить при помощи метода getRegPaths, который может вернуть как все существующие указатели, так и указатели, соответствующие определённой опции


	- - - Методы - - -
	
	> this.switchOn() - "внешний" метод, использующийся для запуска функционала калькулятора
	
	> this.switchOff() - "внешний" метод, использующийся для остановки функционала калькулятора
	
	> this.restart() - "внешний" метод, использующийся для перезапуска функционала калькулятора. Используется в случае внесения изменений в функционал калькулятора после его запуска
	
	> this.addToElementsValueHandlers(selector,handler) - "внешний" метод, использующийся для добавления функции(handler), применяемой для получения значения элемента калькулятора(selector)
	
	> this.addToCompsEvents(selector,event,handler) - "внешний" метод, использующийся для добавления функции(handler), применяемой в качестве обработчика события(event) для определённого элемента калькулятора(selector)
	
	> this.addToTotalCostModifiers(handler) - "внешний" метод, использующийся для добавления функции(handler), применяемой в качестве корректировщика итоговой стоимости вычисленной калькулятором
	
	> this.addToEventsCalledImmediatly(event,selector) - "внешний" метод, использующийся для добавления информации о событии(event), которое должно быть вызвано для элемента калькулятора(selector) сразу же после включения его функционала (метод switchOn)
	
	> this._addToOpt(pathToAdd,value) - "внутренний" метод, использующийся для добавления значения(value) в структурированную опцию калькулятора, в соответствии с переданным путём добавления(pathToAdd(массив)). Используется во "внешних" методах типа "addTo..."
	
	> this.removeFromOpt(regPath) - "внешний" метод, использующийся для удаления конечного значения из структурированной опции калькулятора на основе указателя в реестре путей(regPath)
	
	> this._removeFromOpt(path,byRegKey) - "внутренний" метод, использующийся для удаления конечного значения из структурированной опции калькулятора на основе пути к этому значению(path) ИЛИ в случае наличия переданного аргумента byRegKey, на основе указателя в реестре путей (в этом случае аргумент path должен содержать именно указатель реестра). Используется во "внешнем" методе removeFromOpt, а также во внутренних методах инициализации опций калькулятора
	
	> this.getOpt(name) - "внешний" метод, использующийся для получения значения определённой неструктурированной опции(name)
	
	> this._getOpt(optName) - "внутренний" метод, использующийся для получения значения определённой опции(optName) любого типа(структ. и неструкт.). Используется во "внешнем" методе getOpt, а также во внутренних методах инициализации опций калькулятора
	
	> this.getFromOpt(regPath) - "внешний" метод, использующийся для получения конечного значения определённой структурированной опции на основе указателя в реестре путей(regPath)
	
	> this._getFromOpt(path) - "внутренний" метод, использующийся для получения конечного значения определённой структурированной опции на основе пути к этому значению(path). Используется во "внешнем" методе getFromOpt
	
	> this.changeOpt(name,value) - "внешний" метод, использующийся для изменения значения на новое(value) в определённой неструктурированной опции(name) 
	
	> this._changeOpt(name,value) - "внутренний" метод, использующийся для изменения значения на новое(value) в определённой неструктурированной опции(name). Используется во "внешнем" методе changeOpt
	
	> this.changeWithinOpt(regPath,newValue) - "внешний" метод, использующийся для изменения значения на новое(newValue) в определённой структурированной опции на основе указателя в реестре путей(regPath) 
	
	> this._changeWitninOpt(path,newValue) - "внутренний" метод, использующийся для изменения значения на новое(newValue) в определённой структурированной опции на основе пути к этому значению(path). Используется во "внешнем" методе changeWithinOpt
	
	> this.getRegPaths(pathFolder) - "внешний" метод, использующийся для получения всех существующих указателей в реестре путей (в случае, если аргумент pathFolder не был передан) ИЛИ указателей в реестре путей соответствующих определённой опции(pathFolder)
	
	> this.displayTotalCost() - "внешний" метод, использующийся для подсчёта и вывода итоговой стоимости
	
	> this.getTotalCost() - "внешний" метод, использующийся ТОЛЬКО для подсчёта итоговой стоимости. Используется в методе displayTotalCost, но может использоваться отдельно
	
	> this.getComponentValue() - "внешний" метод, использующийся для получения значения определённого элемента калькулятора. Используется в методе getTotalCost, но может использоваться отдельно. В случае использования вне getTotalCost рекомендуется определять целевой элемент самостоятельно(метод setTargetComp(см. ниже)), а также снимать определение целевого элемента(метод unsetTargetComp(см. ниже)) после получения стоимости элемента
	
	> this.showHint(element) - "внешний" метод, использующийся для демонстрации стоимости определённого элемента калькулятора(element). Рекомендуется использовать в функциях-обработчиках событий для элементов калькулятора
	
	> this.convertCompValue(value) - "внешний" метод, использующийся для приведения значения(value) элемента калькулятора к виду ожидаемому в getComponentValue. Рекомендуется использовать в функциях получающих значения определённых элементов калькулятора
	
	> this.setTargetComp(t) - "внешний" метод, использующийся для определения элемента калькулятора(t) как целевого
	
	> this.unsetTargetComp() - "внешний" метод, использующийся для снятия определения целевого элемента
	
	> this._addAllData(data) - "внутренний" метод, использующийся для добавления всех переданных в калькулятор опций(data). Используется в конструкторе класса
	
	> this._formFullPathAndAdd(fullPath,val) - "внутренний" метод, использующийся для добавления значения(val) в структурированную опцию, а также формирования пути к добавляемому значению(fullPath). Метод рекурсивный. Используется в методе _addAllData
	
	> this._addToPathsRegistry(name,path) - "внутренний" метод, использующийся для добавления пути(path) к значению структурированной опции(name) в реестр. Используется в методе _addToOpt. Возвращает указатель реестра путей на который был записан добавляемый путь
	
	> this._deleteFromPathsRegistry(reg) - "внутренний" метод, использующийся для "удаления" из реестра определённого пути на основе указателя(reg). Используется в методе _removeFromOpt
	
	> this._getPathFromRegistry(pathFolder,pathInd) - "внутренний" метод, использующийся для получения пути к значению структурированной опции из реестра путей, на основе имени опции(pathFolder) и порядкового номера пути в реестре(pathInd). Используется во "внутрених" и "внешних" методах, связанных с получением/изменением/удалением значений из структурированных опций, а также в методе _checkRequiredParams
	
	> this._checkElementVisibility() - "внутренний" метод, использующийся для проверки целевого элемента калькулятора на отображения на странице. Скрытые элементы калькулятора не участвуют в формировании итоговой стоимости. Является рекурсивным. Используется в методе getComponentValue
	
	> this._checkRequiredParams(exceptionslist) - "внутренний" метод, использующийся для проверки наличия всех опций, кроме не являющихся важными(exceptionslist). Используется в методе switchOn
	
	> this._checkEmptyObj(obj) - "внутренний" метод, использующийся для определения является ли объект(obj) пустым. Используется в конструкторе класса
	
	> this._isPatternedProp(propsList) - "внутренний" метод, использующийся для определения указывает ли часть требований к опциям(propsList) на то, что опция должна быть структурированной. Используется в большом количестве "внешних" и "внутренних" методов
	
	> this._checkKeyTypeInFor(key) - "внутренний" метод, использующийся для типа данных ключа, получаемого в цикле for-in. Используется в методе _addAllData
	

	- - - Свойства и константы - - -
	
	> this._costObjDataHolder - "внутреннее" свойство для хранения доп. информации, используемой при вычислении стоимости текущего элемента или общей стоимости
	
	> this._patternedDataPaths - "внутреннее" свойство, используемое как реестр всех существующих путей доступа к конечным значениям структурированных опций калькулятора. Структура свойства:
		{
			имя_структ_св_ва:[путь1(массив),путь2(массив)]
		}
	
	> this._OPTS_PROP - "внутренняя" константа с именем свойства, в котором хранятся все опции калькулятора
	
	> this._ERROR_INTRO - "внутренняя" константа с текстом, использующимся в начале оповещения об ошибках калькулятора
	
	> this._VALUE_OF_DELETE - "внутренняя" константа со значением, которое, в случае удаления, будет заменять текущее конечное значение структурированных опций и информацию в реестре путей
	
	> this._DEF_VALUE_FOR_SIMPLE_OPT - "внутренняя" константа со значением, которое, будет присвоено неструктурированной опции в случае, если она не была передана во время создания объекта класса CostDeterminant
	
	> this._PATTERN_TYPES - "внутренняя" константа содержит условные обозначения типов данных, которые будут использоваться при формировании и проверке путей к конечным значениям структурированных опций
	
	> this._FIELDS_DISPOSITION - "внутренняя" константа содержит информацию о всех опциях, которые должны быть определены для корректной работы калькулятора, а также требования к их значениям.
	Особенности:
		>> Для неструктурированных опций -> 
			имя свойства - имя опции
			значение свойства - ожидаемый тип данных
		>> Для структурированных свойств ->
			>>> innerObjectPattern - содержит требования к вложенному в опцию структурированному типу данных. Содержит объект, состоящий из следующих элементов:
				keys - требования(шаблон) к ключам добавляемого "структурированного" значения.
					Предствляет из себя массив следующего содержания:
					[
						тип_внешнего_ключа,
						тип_внут_ключа_ур1,
						тип_внут_ключа_ур2,
						...
					]
				values - требования(шаблон) к значениям добавляемого "структурированного" значения
					Предствляет из себя массив следующего содержания:
					[
						тип_внешнего_знач,
						тип_внут_знач_ур1,
						тип_внут_знач_ур2,
						...
					]
*/
let CostDeterminant=class {
	constructor(data){
		this._costObjDataHolder={};
		this._patternedDataPaths={};
		
		// Добавляем константы для объекта
		Object.defineProperties(this,{
			"_OPTS_PROP":{value:"_options"},
			"_ERROR_INTRO":{value:"CostDeterminant says>>> "},
			"_VALUE_OF_DELETE":{value:undefined},
			"_DEF_VALUE_FOR_SIMPLE_OPT":{value:false},
			"_PATTERN_TYPES":{value:{
				"array":"a",
				"object":"o",
				"string":"s",
				"number":"n",
				"boolean":"b",
				"function":"f"
			}},
			"_FIELDS_DISPOSITION":{value:{
				totalElementSelector:"string",
				componentsSelector:"string",
				currencyName:"string",
				elemValueAttr:"string",
				elemValueFactorAttr:"string",
				elementsValueHandlers:{
					innerObjectPattern:{
						keys:["s","s"],
						values:["o","f"]
					}
				},
				hintElementID:"string",
				compsEvents:{
					innerObjectPattern:{
						keys:["s","s","s"],
						values:["o","o","f"]
					}
				},
				totalCostModifiers:{
					innerObjectPattern:{
						keys:["s","n"],
						values:["a","f"]
					}
				},
				eventsCalledImmediatly:{
					innerObjectPattern:{
						keys:["s","n","s"],
						values:["a","o","s"]
					}
				}
			}}
		});
		
		let optsStorage=this._OPTS_PROP;
		
		this[optsStorage]={};
		
		// Определяем что будем делать в случае, если при создании объекта был передан аргумент с опциями не соответствующий ожиданиям(не объект или пустой объект)
		if(typeof data!="object" || Array.isArray(data)===true || typeof data=="object" && this._checkEmptyObj(data)===true){
			this[optsStorage].totalElementSelector=this._DEF_VALUE_FOR_SIMPLE_OPT;
			this[optsStorage].componentsSelector=this._DEF_VALUE_FOR_SIMPLE_OPT;
			this[optsStorage].currencyName=this._DEF_VALUE_FOR_SIMPLE_OPT;
			this[optsStorage].elemValueAttr=this._DEF_VALUE_FOR_SIMPLE_OPT;
			this[optsStorage].elemValueFactorAttr=this._DEF_VALUE_FOR_SIMPLE_OPT;
			this[optsStorage].hintElementID=this._DEF_VALUE_FOR_SIMPLE_OPT;			
			this[optsStorage].compsEvents={};
			this[optsStorage].totalCostModifiers=[];
			this[optsStorage].eventsCalledImmediatly=[];
		}
		else 
			this._addAllData(data);
	}	

	switchOn(){
		let optionalParams=["totalCostModifiers","eventsCalledImmediatly"];// необязательные опции
		
		// Проводим проверку всех необходимых для запуска опций
		let checkResult=this._checkRequiredParams(optionalParams);
		// Если не все необходимые опции присутствуют выбрасываем ошибку в консоль и прерываем работу метода
		if(checkResult===false){
			console.error(this._ERROR_INTRO+'Method=> switchOn; Error=> There are not enough options to switch on engine. Check list of required options in documentation');
			return false;
		}
		else {
			// Получаем опцию, отвечающую за функции-обработчики событий
			let compsEvents=this._getOpt("compsEvents");
			// Если не получилось получить опцию - выбрасываем ошибку в консоль и прерываем работу метода
			if(compsEvents===false){
				console.error(this._ERROR_INTRO+'Method=> switchOn; Error=> Unable to get data from >compsEvents<');
				return false;
			}
			
			// Обходим опцию по всем селекторам(i)
			for (let i in compsEvents) {
				if(compsEvents[i]==this._VALUE_OF_DELETE)
					continue;
				// Обходим все события(x) их функции-обработчики(compsEvents[i][x])
				for (let x in compsEvents[i]) {
					// Если функция-обработчик определена, как пустая лямбда-функция, то идем дальше по циклу
					if(compsEvents[i][x].toString()=="()=>{}")
						continue;
					
					// Вешаем на селектор(i) отслеживание события(x), с указанием его функции-обработчика(compsEvents[i][x])
					$(i).on(x,compsEvents[i][x]);
				}
			}
			
			// Получаем опцию, отвечающую за события, которые нужно вызвать сразу после вкл. функционала
			let eventsCalledImmediatly=this._getOpt("eventsCalledImmediatly");
			// Если не получилось получить опцию - выбрасываем ошибку в консоль и прерываем работу метода
			if(eventsCalledImmediatly===false){
				console.error(this._ERROR_INTRO+'Method=> switchOn; Error=> Unable to get data from >eventsCalledImmediatly<');
				return false;
			}
			// Обходим опцию 
			for (let z=0,b=eventsCalledImmediatly.length;z<b;z++) { 
				if(eventsCalledImmediatly[z]==this._VALUE_OF_DELETE)
					continue;
				// Обходим все события(z) и соответствующие им селекторы(eventsCalledImmediatly[z][i])
				for (let i in eventsCalledImmediatly[z]) { 
					if(eventsCalledImmediatly[z][i]==this._VALUE_OF_DELETE)
						continue;
					// Вызываем для селектора целевое событие
					$(eventsCalledImmediatly[z][i]).trigger(i);		
				}
			}
			this.displayTotalCost();// Считаем и выводим итоговую стоимость
		}
	}
	
	switchOff(){
		// Получаем опцию, отвечающую за функции-обработчики событий
		let compsEvents=this._getOpt("compsEvents");
		if(compsEvents!==false){
			// Обходим опцию по всем селекторам(i)
			for (let i in compsEvents) {
				$(i).off(); // Снимаем все обработчики событий с элементов соответствующих селектору(i)
			}
		}
	}
	
	restart(){
		this.switchOff();
		this.switchOn();
	}

	addToElementsValueHandlers(selector,handler){
		let pathForAdd=["elementsValueHandlers",selector];
		return this._addToOpt(pathForAdd,handler);
	}
	
	addToCompsEvents(selector,event,handler){
		let pathForAdd=["compsEvents",selector,event];
		return this._addToOpt(pathForAdd,handler);
	}
	
	addToTotalCostModifiers(handler){
		let pathForAdd=["totalCostModifiers",false];
		return this._addToOpt(pathForAdd,handler);
	}
	
	addToEventsCalledImmediatly(event,selector){
		let pathForAdd=["eventsCalledImmediatly",false,event];
		return this._addToOpt(pathForAdd,selector);
	}
	
	_addToOpt(pathToAdd,value){
		let optsStorage=this._OPTS_PROP;
		
		// Получаем шаблон пути для ключей(keys) и значений(values) по целевой опции(pathToAdd[0])
		let pathPattern=this._FIELDS_DISPOSITION[pathToAdd[0]]['innerObjectPattern']['values'];
		let pathKeysPattern=this._FIELDS_DISPOSITION[pathToAdd[0]]['innerObjectPattern']['keys'];
		
		// Проверяем получили ли мы оба шаблона путей(ключи и значения), если нет выбрасываем ошибки и прерываем метод
		if(pathPattern==undefined || pathKeysPattern==undefined){
			console.error(this._ERROR_INTRO+'Method=> _addToOpt; Error=> While adding an option >'+pathToAdd[0]+'< , it was found that the path pattern used for this proccess to work correctly was missing');
			return false;
		}
		
		// Проверяем можно ли проверить по полученным шаблонам путей(ключи и значения) путь по которому следует добавить требуемое значение(pathToAdd), если нет выбрасываем ошибки и прерываем метод
		if(pathPattern.length!=pathToAdd.length || pathKeysPattern.length!=pathToAdd.length){
			console.error(this._ERROR_INTRO+'Method=> _addToOpt; Error=> While adding an option >'+pathToAdd[0]+'< , it was found that the path pattern used for this proccess to work correctly was damaged');
			return false;
		}
		
		let optsData=this[optsStorage];
		let falseKeyPermit=false;// Флаг определяющий, что в качестве фрагмента пути может быть передано булевое false
		let newDataStartAt=false;// Переменная для хранения индекса пути, начиная с которого начали добавляться новые значения(потребуется в случае, если конечное значение не пройдет проверку и будет необходимо удалить всю цепочку созданных элементов, связанных с добавлением этого значения)
		// Обходим путь для добавления значения
		for(let a=0;a<pathToAdd.length;a++){
			let typeOfKey=typeof pathToAdd[a];
			// Проверяем на наличие возможной ошибки в пути добавления значения: фрагмент пути имеет значение false, тогда когда он недопустим ИЛИ тип фрагмента пути не соответствует ожидаемому в шаблону, с учётом, что этот не является булевым
			if((pathToAdd[a]===false && falseKeyPermit===false)||(this._PATTERN_TYPES[typeOfKey]!=this._PATTERN_TYPES["boolean"] && pathKeysPattern[a]!=this._PATTERN_TYPES[typeOfKey])){
				// Если в процессе добавления значения были созданы новые элементы - удаляем их
				if(newDataStartAt!==false)
					this._removeFromOpt( pathToAdd.slice( 0,(newDataStartAt+1) ) );
				console.error(this._ERROR_INTRO+'Method=> _addToOpt; Error=> In the process of adding an option, a mismatch of the passed key (>'+pathToAdd[a]+'<) with the expected(>'+pathKeysPattern[a]+'<) type was detected');
				return false;
			}
			// Проверяем если фрагмент пути имеет значение false и его применение допустимо, то мы имеем дело с добавлением значения в массив, поэтому значение текущего фрагмента пути меняем на кол-во элементов в этом самом массиве
			else if(pathToAdd[a]===false && falseKeyPermit===true)
				pathToAdd[a]=optsData.length;
			
			if(a!=pathToAdd.length-1){
				// В случае, если в опции нет соответствующего переданному фрагменту элемента, то создаём его исходя из того, какой тип данных ожидается в шаблоне
				if(optsData[pathToAdd[a]]==undefined){
					if(pathPattern[a]==this._PATTERN_TYPES["array"])
						optsData[pathToAdd[a]]=[];
					else if(pathPattern[a]==this._PATTERN_TYPES["object"])
						optsData[pathToAdd[a]]={};
					
					// Если отметка о индексе с которого началось создание новых элементов в опции ещё не определена присваиваем ей в качестве значения текущий индекс цикла
					if(newDataStartAt===false)
						newDataStartAt=a;
				}
				
				optsData=optsData[pathToAdd[a]];
			}
			else {
				// Проверяем существует ли конечный элемент пути в опции, если да, то прерываем метод, выкидываем ошибку в консоль и удаляем созданные ранее элементы(если они были)
				if(optsData[pathToAdd[a]]!=undefined){
					if(newDataStartAt!==false)
						this._removeFromOpt( pathToAdd.slice( 0,(newDataStartAt+1) ) );
					console.error(this._ERROR_INTRO+'Method=> _addToOpt; Error=> In the process of adding an option along the following path >'+(pathToAdd.toString())+'< a structural mismatch was found with the expected (>'+(pathKeysPattern.toString())+'<)');
					return false;
				}
				else{
					optsData[pathToAdd[a]]=value;
					let keyInReg=this._addToPathsRegistry(pathToAdd[0],pathToAdd);// добавляем путь к добавленному конечному значению в реестр
					return keyInReg;// возвращаем указатель в реестре на путь к добавленному значению
				}
			}
			
			// Определяемся с типом текущего элемента опции(если массив, то можно ожидать в следующем фрагменте false, если объект, то нет)
			if(pathPattern[a]==this._PATTERN_TYPES["array"])
				falseKeyPermit=true;
			else if(pathPattern[a]==this._PATTERN_TYPES["object"])
				falseKeyPermit=false;
		}
	}

	removeFromOpt(regPath){
		// Указатель в реестре должны иметь размер в 2 элемента
		if(regPath.length!=2){
			console.error(this._ERROR_INTRO+'Method=> removeFromOpt; Error=> An invalid registry path(>'+(regPath.toString())+'<) was specified when trying to remove an option. The expected path must be exactly two elements');
			return false;
		}
		
		this._removeFromOpt(regPath,true);
	}
	
	_removeFromOpt(path,byRegKey){// Метод может удалять значения из "структурированных" опций, как на основе реального пути к целевому значению, так и на основе указателя в реестре путей(если передан аргумент byRegKey)
		let optsStorage=this._OPTS_PROP;
		// Если удаление происходит на основе указателя реестра путей, то получаем реальный путь к значению и "удаляем" запись о данном пути из реестра
		if(byRegKey!=undefined){
			let realPath=this._getPathFromRegistry(path[0],path[1]);
			this._deleteFromPathsRegistry(path);
			path=realPath;
		}
		if(path===false){
			console.error(this._ERROR_INTRO+'Method=> _removeFromOpt; Error=> When trying to remove an option, a non-existent path was specified in the registry');
			return false;
		}
		let data=this[optsStorage];// Определяем свойство в котором содержатся опции калькулятора, как стартовую точку для прохода по пути к целевому значению
		// Идем по пути к целевому значению
		for(let a=0;a<path.length;a++){
			// Если на текущем фрагменте пути в опциях нет соответствующего элемента, то идти дальше нет смысла
			if(data[path[a]]==undefined)
				break;
			// Если мы ещё не дошли до конца пути, то меняем элемент опции, соответствущий предыдущему фрагменту пути на элемент по текущему фрагменту
			if(a!=path.length-1)
				data=data[path[a]];
			// Если дошли до конца, то заменяем "удаляемое" значение на специальное, указывающее, что значение удалено; если значение было функцией, то меняем её ну пустую лямбду
			else {
				let endValueType=this._FIELDS_DISPOSITION[path[0]]['innerObjectPattern']['values'][a];
				if(endValueType!=this._PATTERN_TYPES["function"])
					data[path[a]]=this._VALUE_OF_DELETE;
				else
					data[path[a]]=()=>{};
			}
		}
	}

	getOpt(name){
		// Ставим ограничение на то, чтобы можно было получить только опцию указанную в списке и не являющуюся "структурированной"
		if(this._FIELDS_DISPOSITION[name]==undefined || this._isPatternedProp(this._FIELDS_DISPOSITION[name])===true){
			console.error(this._ERROR_INTRO+'Method=> getOpt; Error=> Unable to access option >'+name+'<');
			return false;
		}
		else
			return this._getOpt(name);
	}
	
	_getOpt(optName){// Прим: данный метод может получить значение любой опции
		let optsStorage=this._OPTS_PROP;
		// Если опция существует и её значение не удалено, то возвращаем её значение
		if(this[optsStorage][optName]!=undefined && this[optsStorage][optName]!=this._VALUE_OF_DELETE)
			return this[optsStorage][optName];
		else
			return false;
	}
	
	getFromOpt(regPath){
		// Указатель в реестре должны иметь размер в 2 элемента
		if(regPath.length!=2){
			console.error(this._ERROR_INTRO+'Method=> getFromOpt; Error=> An invalid registry path(>'+(regPath.toString())+'<) was specified when trying to remove an option. The expected path must be exactly two elements');
			return false;
		}
		
		// Получаем реальный путь на основе указателя в реестре и если он там есть, то получаем значение из "структурированной" опции
		let realPath=this._getPathFromRegistry(regPath[0],regPath[1]);
		if(realPath!==false)
			return this._getFromOpt(realPath);
		else{
			console.error(this._ERROR_INTRO+'Method=> getFromOpt; Error=> Unable to find registry entry for path >'+(regPath.toString())+'<');
			return false;
		}
	}
	
	_getFromOpt(path){
		let optsStorage=this._OPTS_PROP;
		
		let dataObj=this[optsStorage];// Определяем свойство в котором содержатся опции калькулятора, как стартовую точку для прохода по пути к целевому значению
		
		// Идем по пути к целевому значению
		for(let a=0;a<path.length;a++){	
			// Если мы ещё не дошли до конца пути, то меняем элемент опции, соответствущий предыдущему фрагменту пути на элемент по текущему фрагменту
			if(a!=path.length-1)				
				dataObj=dataObj[ path[a] ];
			else
				return dataObj[ path[a] ];
		}
	}
	
	changeOpt(name,value){
		// Ставим ограничение на то, чтобы можно было изменить значение только опции указанной в списке и не являющейся "структурированной"
		if(this._FIELDS_DISPOSITION[name]==undefined || this._isPatternedProp(this._FIELDS_DISPOSITION[name])===true){
			console.error(this._ERROR_INTRO+'Method=> changeOpt; Error=> Unable to access option >'+name+'<');
			return false;
		}
		else {
			// Проверяем соответствует ли тип нового значения опции требованиям
			if(typeof value!=this._FIELDS_DISPOSITION[name]){
				console.error(this._ERROR_INTRO+'Method=> changeOpt; Error=> While attempting to change the value of an option >'+name+'<, it was determined that the data type of the new value(>'+value+'<) did not match what was expected(>'+this._FIELDS_DISPOSITION[name]+'<)');
				return false;
			}
			return this._changeOpt(name,value);
		}
	}
	
	_changeOpt(name,value){
		let optsStorage=this._OPTS_PROP;
		
		// Если опция существует - меняем её значение на новое, в противном случае - выбрасываем ошибку в консоль
		if(this[optsStorage][name]!=undefined)
			this[optsStorage][name]=value;
		else {
			console.error(this._ERROR_INTRO+'Method=> _changeOpt; Error=> Option >'+name+'< not found');
			return false;
		}
		return true;
	}
	
	changeWithinOpt(regPath,newValue){
		// Указатель в реестре должны иметь размер в 2 элемента
		if(regPath.length!=2){
			console.error(this._ERROR_INTRO+'Method=> changeWithinOpt; Error=> An invalid registry path(>'+(regPath.toString())+'<) was specified when trying to remove an option. The expected path must be exactly two elements');
			return false;
		}
		
		// Получаем реальный путь на основе указателя в реестре и если он там есть, то пытаемся изменить значение "структурированной" опции
		let realPath=this._getPathFromRegistry(regPath[0],regPath[1]);
		if(realPath!==false)
			return this._changeWitninOpt(realPath,newValue);
		else{
			console.error(this._ERROR_INTRO+'Method=> changeWithinOpt; Error=> Unable to find registry entry for path >'+(regPath.toString())+'<');
			return false;
		}
	}
	
	_changeWitninOpt(path,newValue){
		let optsStorage=this._OPTS_PROP;
		
		let dataObj=this[optsStorage];// Определяем свойство в котором содержатся опции калькулятора, как стартовую точку для прохода по пути к целевому значению
		
		// Идем по пути к целевому значению
		for(let a=0;a<path.length;a++){	
			// Если мы ещё не дошли до конца пути, то меняем элемент опции, соответствущий предыдущему фрагменту пути на элемент по текущему фрагменту
			if(a!=path.length-1)
				dataObj=dataObj[ path[a] ];
			else {
				// Определяем тип данных нового значения опции и проверяем соответствует ли он требованиям; если всё ОК - переписываем значение на новое и возвращаем true
				let typeOfNewVal=typeof newValue;
				if(this._PATTERN_TYPES[typeOfNewVal]!=undefined && this._FIELDS_DISPOSITION[ path[0] ]['innerObjectPattern']['values'][a]==this._PATTERN_TYPES[typeOfNewVal]){
					dataObj[ path[a] ]=newValue;
					return true;
				}
				else
					return false;
			}
		}
	}

	getRegPaths(pathFolder){
		// Если были запрошены указатели только для конкретной опции проверяем наличие в реестре путей относящихся именно к ней
		if(pathFolder!=undefined && this._patternedDataPaths[pathFolder]==undefined){
			console.error(this._ERROR_INTRO+'Method=> getRegPaths; Error=> When trying to get the paths registered for >'+pathFolder+'<, the requested >'+pathFolder+'< was found to be missing');
			return false;
		}
		let folders=[];
		// Если были запрошены указатели реестра путей на все опции, то забираем из реестра имена всех существующих опций
		if(pathFolder==undefined)
			folders=Object.keys(this._patternedDataPaths);
		else
			folders.push(pathFolder);
		
		let paths={};
		// Обходим опции, которые существуют в реестре путей
		for(let a=0;a<folders.length;a++){
			let emptyFolder=true;// флаг, определяющий отсутствие путей зарегистрированных для текущей опции
			paths[folders[a]]=[];
			// Обходим ВСЕ пути существующие в реестре и связанные с текущей опцией
			for(let b=0;b<this._patternedDataPaths[folders[a]].length;b++){
				// Проверяем, чтобы в реестре не содержалось вместо пути значение, характерное для "удалённого" элемента
				if(this._patternedDataPaths[folders[a]][b]!=this._VALUE_OF_DELETE){
					paths[folders[a]].push([folders[a],b]);
					emptyFolder=false;
				}
			}

			if(emptyFolder===true)
				delete paths[folders[a]];
		}
		// Если были запрошены указатели только для конкретной опции и в сформированных данных есть соответствующий элемент, то возвращаем только его
		if(pathFolder!=undefined && paths[pathFolder]!=undefined)
			return paths[pathFolder];
		// Если были запрошены указатели только для конкретной опции и в сформированных данных нет соответствующего элемента, то возвращаем пустой массив
		else if(pathFolder!=undefined && paths[pathFolder]==undefined)
			return [];
		else
			return paths;
		
	}

	displayTotalCost(){
		let tempVar=this.getTotalCost();// подсчитываем итоговую стоимость
		// Получаем опцию селектора элемента отображающего итоговую стоимость, если она не была определёна, то указываем вместо неё пустую строку
		let totalElementSelector=this._getOpt("totalElementSelector");
		if(totalElementSelector===false)
			totalElementSelector="";
		
		// Получаем опцию определяющую название валюты, если она не была определёна, то указываем вместо неё пустую строку
		let currencyName=this._getOpt("currencyName");
		if(currencyName===false)
			currencyName="";
		
		$(totalElementSelector).text(tempVar+" "+currencyName);
	}
	
	getTotalCost(){
		let totalSum=0;
		let classObj=this;
		// Получаем опцию селектора элемента участвующего в формировании итоговой стоимости, если она не была определёна, то указываем вместо неё пустую строку
		let componentsSelector=this._getOpt("componentsSelector");
		if(componentsSelector===false)
			componentsSelector="";
		
		// Для каждого элемента, участвующего в формировании итоговой стоимости выполняем анон функцию
		$(componentsSelector).each(function(){
			classObj.setTargetComp($(this)); // Определяем в качестве целевого элемента калькулятора текущий элемент, для которого выполняется функция
			let tmpVar=classObj.getComponentValue(); // Получаем стоимость целевого элемента
			// Если удалось получить стоимость, то добавляем её к текущей стоимости
			if(tmpVar!=undefined)
				totalSum+=tmpVar[0]*tmpVar[1];				
		});
		this.unsetTargetComp(); // Отменяем целевой элемент калькулятора
		
		// Получаем опцию, отвечающую за функции корректирующие итоговую стоимость, если опцию получить не удалось, то указываем вместо неё пустой массив
		let totalCostModifiers=this._getOpt("totalCostModifiers");
		if(totalCostModifiers===false)
			totalCostModifiers=[];
		
		// Если массив с функциями корректирующими итоговую стоимость не пустой, то обходим его и применяем каждую указанную функцию к итоговой стоимости
		if(totalCostModifiers.length>0){
			for(let a=0;a<totalCostModifiers.length;a++){
				if(totalCostModifiers[a]!=this._VALUE_OF_DELETE)
					totalSum=totalCostModifiers[a](totalSum);
			}
		}
		// "Глушим" вероятность получения отрицательной стоимости
		if(totalSum<0)
			totalSum=0;
		
		// Округляем итоговую стоимость до сотых долей
		if(totalSum!==0)
			totalSum=Math.round(totalSum*100)/100;
		
		return totalSum;
	}
	
	getComponentValue(){
		// Проверяем задан ли целевой элемент калькулятора
		if(this._costObjDataHolder.targetC!=undefined){
			// Получаем опцию, отвечающую за функции получающие стоимости отдельных элементов калькулятора, если опцию получить не удалось, то указываем вместо неё пустой объект
			let elementsValueHandlers=this._getOpt("elementsValueHandlers");
			if(elementsValueHandlers===false)
				elementsValueHandlers={};
			
			// Получаем опцию, содержащую имя атрибута, хранящего стоимость элемента калькулятора, если опцию получить не удалось, то указываем вместо неё пустую строку
			let elemValueAttr=this._getOpt("elemValueAttr");
			if(elemValueAttr===false)
				elemValueAttr="";
			
			// Получаем опцию, содержащую имя атрибута, хранящего множитель для значения элемента калькулятора, если опцию получить не удалось, то указываем вместо неё пустую строку
			let elemValueFactorAttr=this._getOpt("elemValueFactorAttr");
			if(elemValueFactorAttr===false)
				elemValueFactorAttr="";
			
			// Обходим все функции получающие стоимости элементов
			for(let i in elementsValueHandlers) {
				// Если целевой элемент калькулятора подходит под требования селектора(i), относящегося к текущей функции получения стоимости, при этом отображается и функция обработчик не пустая лямбда функция, то вызывыаем её для получения стоимости текущего элемента
				if ($(this._costObjDataHolder.targetC).is(i)===true && this._checkElementVisibility()===true && elementsValueHandlers[i].toString()!="()=>{}"){
					return elementsValueHandlers[i](this._costObjDataHolder.targetC,elemValueAttr,elemValueFactorAttr);
				}
			}
		}
		else 
			console.error(this._ERROR_INTRO+'Method=> getComponentValue; Error=> Unable to determine the component whose value is to be retrieved. If you use this method, make sure you also use >setTargetComp< to define the target component and >unsetTargetComp< to clear the target component information.');
		return [0,1];
	}

	showHint(element){
		let hintElementID=this._getOpt("hintElementID"); // получаем из опций id элемента, демонстрирующего стоимость текущего элемента
		
		// Получаем опцию определяющую название валюты, если она не была определёна, то указываем вместо неё пустую строку
		let currencyName=this._getOpt("currencyName");
		if(currencyName===false)
			currencyName="";
		
		this.setTargetComp(element); // Определяем целевой элемент калькулятора
		let currentValue=this.getComponentValue(); // Берём его стоимость
		//Если удалось получить стоимость, то считаем её и пытаемся вывести в качестве подсказки
		if(currentValue!=undefined){
			let elementValue=currentValue[0]*currentValue[1];
			// Если полученный id элемента подсказки можно использовать, то удаляем существующий элемент с таким id и добавляем новый
			if(hintElementID!==false){
				$("#"+hintElementID).remove();
				$(element).before("<span id='"+hintElementID+"'>"+elementValue+" "+currencyName+"</span>");
			}
		}
		this.unsetTargetComp(); // Отменяем определение целевого элемента калькулятора
	}

	setTargetComp(t){ this._costObjDataHolder.targetC=t;	}
	
	unsetTargetComp(){ delete this._costObjDataHolder.targetC; }
	
	convertCompValue(value){
		/*
			Функция ожидает массив состоящий из 2-х элементов:
				0 - стоимость
				1 - множитель
			Для формирования правильного значения только с учетом стоимости:
				[стоимость,1]
		*/
		for(let a=0,b=value.length;a<b;a++){
			if (value[a]==undefined){
				value[a]=a;
			}
			else {
				value[a]=parseInt(value[a]);
			}
		} 
		return value;
	}

	_addAllData(data){
		let reqs=this._FIELDS_DISPOSITION;
		let stKey=this._OPTS_PROP; 
		
		// Обходим список всех возможных опций калькулятора
		for(let i in reqs){
			let patternedFlag=this._isPatternedProp(reqs[i]); // проверяем является ли опция "структурированной"
			
			if(patternedFlag===true){ // если опция "структурированая"
				if(data[i]!=undefined){ // и она существует в добавляемых
					// Приводим ключ к числовому типу, если он имеет признаки числа
					if(this._checkKeyTypeInFor(i)=="number")
						i*=1;
					
					// Добавляем опцию, при этом формируя путь куда она должна быть добавлена
					this._formFullPathAndAdd([i],data[i]);
				}
			}
			else if(patternedFlag===false && data[i]!=undefined){ // если опция "неструктурированная" и она существует в добавляемых данных
				// при этом в добавляемых данных это не структурированный тип данных и тип совпадает с ожидаемым; тогда записываем в соотв. опцию
				if(typeof data[i]!="object" && typeof data[i]==reqs[i])
					this[stKey][i]=data[i];
				else 
					console.error(this._ERROR_INTRO+'Method>> _addAllData; Error>> >'+i+'< has wrong data type (expected: >'+reqs[i]+'<)');					
			}
			else if(patternedFlag===false && data[i]==undefined){ // если опция "неструктурированная" и её нет в добавляемых данных, то указываем для неё спец. дефолтное значение
				this[stKey][i]=this._DEF_VALUE_FOR_SIMPLE_OPT;
			}
		}
	}
	
	_formFullPathAndAdd(fullPath,val){
		// Если переданное в метод значение объект и не является пустым
		if(typeof val=="object" && this._checkEmptyObj(val)===false){
			// Обходим все его элементы
			for(let i in val){
				// Приводим ключ текущего элемента к числу, если он имеет признаки числа
				if(this._checkKeyTypeInFor(i)=="number")
					i*=1;
				
				let newPath=fullPath.slice(0); // берём отдельную копию от массива пути
				newPath.push(i); 
				
				// Вызываем рекурсивно текущий метод и передаём ему массив пути, сформированный выше, а также текущий элемент объекта
				this._formFullPathAndAdd(newPath,val[i]);
			}
		}
		// Если переданное в метод значение пустой объект, то выкидываем ошибки в консоль и прерываем метод
		else if(typeof val=="object" && this._checkEmptyObj(val)===true){
			console.error(this._ERROR_INTRO+'Method=> _formFullPathAndAdd; Error=> Property >'+fullPath[(fullPath.length-1)]+'< in >'+fullPath[0]+'< contains an invalid empty structured value');
			return false;
		}
		else // Если переданное значение не является объектом, то вызываем метод добавления значения в "структурированную" опцию
			this._addToOpt(fullPath,val);
		
	}
		
	_addToPathsRegistry(name,path){
		// Если в реестре ещё нет раздела, относящегося к опции, путь к значению которой мы хотим добавить, то создаём такой раздел
		if(this._patternedDataPaths[name]==undefined)
			this._patternedDataPaths[name]=[];
		
		// Добавляем в конец реестра путей соответствующий опции целевой путь
		this._patternedDataPaths[name].push(path);
		
		// Возвращаем указатель в реестре на добавленный путь. Структура: [имя_опции,индекс_пути]
		return [name,this._patternedDataPaths[name].length-1];
	}
	
	_deleteFromPathsRegistry(reg){
		if(this._patternedDataPaths[reg[0]][reg[1]]!=undefined)
			this._patternedDataPaths[reg[0]][reg[1]]=this._VALUE_OF_DELETE;
	}
	
	_getPathFromRegistry(pathFolder,pathInd){ //Прим.: pathFolder и pathInd не являются обязательными для передачи
		
		// Разбираемся какие пути из реестра необходимо вернуть, основываясь на наличии переданных аргументов
		// Если аргументы не были переданы, то возвращаем все пути из реестра (опять таки новую копию, а не ссылку)
		if(pathFolder==undefined && pathInd==undefined)
			return Object.assign({},this._patternedDataPaths);
		// Если запрашиваются все пути для определённой опции, т.е. был передан только аргумент pathFolder
		else if(pathFolder!=undefined && pathInd==undefined){
			// Проверяем на наличие путей в реестре для соответствующей опции И, если они есть, то возвращаем их
			if(this._patternedDataPaths[pathFolder]!=undefined)
				return this._patternedDataPaths[pathFolder].slice(0);
			else
				return false;
		}
		// Если необходимо получить конкретный путь для конкретной опции
		else{
			// Проверяем в реестре наличие путей для соответствующей опции и уточняем не имеет ли запрашиваемый путь значение, указывающее на то, что он был удалён
			if(this._patternedDataPaths[pathFolder]!=undefined && this._patternedDataPaths[pathFolder][pathInd]!=this._VALUE_OF_DELETE)
				return this._patternedDataPaths[pathFolder][pathInd].slice(0);
			else
				return false;
		}
	}
	
	_checkElementVisibility(){
		// Проверяем бы ли определён целевой элемент калькулятора
		if(this._costObjDataHolder.targetC!=undefined){
			let visibilityDetector=true; // флаг указывающий на то, что элемент отображается
			// Обходим все элементы-предки, начиная с родителя и проверяем каждый из них, на то не является ли какой-то их них скрытым, при помощи css-настройки display
			$(this._costObjDataHolder.targetC).parents().each(function(){
				if ($(this).css("display")=="none") {
					visibilityDetector=false; // если такой предок найден, то меняем флаг отображения на false
				}
			});
			return visibilityDetector;
		}
		else
			console.error(this._ERROR_INTRO+'Method=> _checkElementVisibility; Error=> Unable to determine the component whose visibility is to be calculated');
	}
		
	_checkRequiredParams(exceptionslist){
		let optsStorage=this._OPTS_PROP;
		let data=this[optsStorage];
		
		let requires=this._FIELDS_DISPOSITION;
		
		// Обходим весь список требуемых калькулятору опций
		for(let i in requires){
			// Не проверяем, те, которые есть в списке исключений
			if(exceptionslist.includes(i)===true)
				continue;
			// Если опция из списка отсутствует в калькуляторе или удалена, то прерываем метод и выбрасываем в консоль ошибку
			if(data[i]==undefined || data[i]==this._VALUE_OF_DELETE){
				console.error(this._ERROR_INTRO+'Method=> _checkRequiredParams; Error=> Option >'+i+'< does not exist or has been removed');
				return false;
			}
			let patternedFlag=this._isPatternedProp(requires[i]); // Уточняем является ли опция из списка "структурированной"
			
			// Если опция из списка должна быть "структурированной"
			if(patternedFlag===true){
				// Получаем все пути из реестра, соответствующие целевой опции
				let paths=this._getPathFromRegistry(i);
				// Если существует хотя бы один путь в реестре, то обходим все полученные из реестра пути и проверяем на то есть ли среди них хоть один, который не удален
				if(paths!==false){
					let pathExists=false;
					for(let a=0;a<paths.length;a++){
						if(paths[a]!==this._VALUE_OF_DELETE){
							pathExists=true;
							break;
						}
					}
					
					if(pathExists===false){
						console.error(this._ERROR_INTRO+'Method=> _checkRequiredParams; Error=> Option >'+i+'<  does not contain any available value');
						return false;
					}
				}
				else{
					console.error(this._ERROR_INTRO+'Method=> _checkRequiredParams; Error=> Unable to find registry entry for option >'+i+'<');
					return false;
				}
			}
			// Если опция из списка "неструктурированная"(судим косвенно из if) и в калькуляторе она имеет значение, соответствующее дефолтному, то выбрасываем ошибку в консоль
			else if(data[i]==this._DEF_VALUE_FOR_SIMPLE_OPT){
				console.error(this._ERROR_INTRO+'Method=> _checkRequiredParams; Error=> Option >'+i+'<  does not contain any available value');
				return false;
			}
		}
		return true;
	}
	
	_checkEmptyObj(obj){
		// Проверка на пустоту объекта заключается в сравнении объекта на типом null и подсчётом количества полученных значений из объекта
		if(obj==null || Object.values(obj).length<1)
			return true;
		return false;
	}
		
	_isPatternedProp(propsList){
		let patternPropName="innerObjectPattern"; // Имя свойства в списке требуемых опций, которое отвечает за наличие "структурированной" части
		// Проверяем является ли переданная часть списка требуемых опций объектом и есть ли в этом объекте свойство с именем, соответствующим "структурированной" опции
		if(typeof propsList=="object" && propsList[patternPropName]!=undefined)
			return true;
		return false;
	}
	
	_checkKeyTypeInFor(key){
		key*=1; // Умножаем значение на 1
		// Если в результате умножения было получено значение NaN, делаем вывод, что переданный для проверки ключ не является числом
		if(isNaN(key)===true)
			return "string";
		else
			return "number";
	}
}