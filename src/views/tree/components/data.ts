export const fetchTreeData = () => {
	// 这里使用模拟数据，实际项目中可替换为真实API调用
	return [
		{
			id: '1',
			label: '一级节点 1',
			level: 0,
			children: [
				{
					id: '1-1',
					label: '二级节点 1-1',
					level: 1,
					children: [
						{ id: '1-1-1', label: '三级节点 1-1-1', level: 2 },
						{ id: '1-1-2', label: '三级节点 1-1-2', level: 2 },
					],
				},
				{
					id: '1-2',
					label: '二级节点 1-2',
					level: 1,
					children: [
						{ id: '1-2-1', label: '三级节点 1-2-1', level: 2 },
						{ id: '1-2-2', label: '三级节点 1-2-2', level: 2 },
					],
				},
			],
		},
		{
			id: '2',
			label: '一级节点 2',
			level: 0,
			children: [
				{
					id: '2-1',
					label: '二级节点 2-1',
					level: 1,
					children: [
						{ id: '2-1-1', label: '三级节点 2-1-1', level: 2 },
						{ id: '2-1-2', label: '三级节点 2-1-2', level: 2 },
					],
				},
				{ id: '2-2', label: '二级节点 2-2', level: 1, },
			],
		},
		{
			id: '3',
			level: 0,
			label: '一级节点 3',
			children: [],
		},
	];
};
