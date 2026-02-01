export const fetchTreeData = () => {
	// 这里使用模拟数据，实际项目中可替换为真实API调用
	return [
		{
			id: '1',
			label: '一级节点 1',
			children: [
				{
					id: '1-1',
					label: '二级节点 1-1',
					children: [
						{ id: '1-1-1', label: '三级节点 1-1-1' },
						{ id: '1-1-2', label: '三级节点 1-1-2' },
					],
				},
				{
					id: '1-2',
					label: '二级节点 1-2',
					children: [
						{ id: '1-2-1', label: '三级节点 1-2-1' },
						{ id: '1-2-2', label: '三级节点 1-2-2' },
					],
				},
			],
		},
		{
			id: '2',
			label: '一级节点 2',
			children: [
				{
					id: '2-1',
					label: '二级节点 2-1',
					children: [
						{ id: '2-1-1', label: '三级节点 2-1-1' },
						{ id: '2-1-2', label: '三级节点 2-1-2' },
					],
				},
				{ id: '2-2', label: '二级节点 2-2' },
			],
		},
		{
			id: '3',
			label: '一级节点 3',
			children: [],
		},
	];
};
