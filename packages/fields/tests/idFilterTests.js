import { matchFilter } from '@keystonejs/test-utils';
import Text from '../src/types/Text';

export const name = 'ID';

export const getTestFields = () => {
  return {
    name: { type: Text },
  };
};

export const initItems = () => {
  return [{ name: 'person1' }, { name: 'person2' }, { name: 'person3' }, { name: 'person4' }];
};

const getIDs = async keystone => {
  const IDs = {};
  await keystone.lists['test'].adapter.findAll().then(data => {
    data.forEach(entry => {
      IDs[entry.name] = entry.id.toString();
    });
  });
  return IDs;
};

export const filterTests = withKeystone => {
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'id name',
      expected,
      sortKey: 'name',
    });

  test(
    'No filter',
    withKeystone(async ({ keystone }) => {
      const IDs = await getIDs(keystone);
      return match(keystone, undefined, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Empty filter',
    withKeystone(async ({ keystone }) => {
      const IDs = await getIDs(keystone);
      return match(keystone, 'where: { }', [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id',
    withKeystone(async ({ keystone }) => {
      const IDs = await getIDs(keystone);
      const id = IDs['person2'];
      return match(keystone, `where: { id: "${id}" }`, [{ id: IDs['person2'], name: 'person2' }]);
    })
  );

  test(
    'Filter: id_not',
    withKeystone(async ({ keystone }) => {
      const IDs = await getIDs(keystone);
      const id = IDs['person2'];
      return match(keystone, `where: { id_not: "${id}" }`, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id_in',
    withKeystone(async ({ keystone }) => {
      const IDs = await getIDs(keystone);
      const id2 = IDs['person2'];
      const id3 = IDs['person3'];
      return match(keystone, `where: { id_in: ["${id2}", "${id3}"] }`, [
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
      ]);
    })
  );

  test(
    'Filter: id_in - empty list',
    withKeystone(({ keystone }) => {
      return match(keystone, 'where: { id_in: [] }', []);
    })
  );

  test(
    'Filter: id_in - missing id',
    withKeystone(({ keystone }) => {
      return match(keystone, 'where: { id_in: ["0123456789abcdef01234567"] }', []);
    })
  );

  test(
    'Filter: id_not_in',
    withKeystone(async ({ keystone }) => {
      const IDs = await getIDs(keystone);
      const id2 = IDs['person2'];
      const id3 = IDs['person3'];
      return match(keystone, `where: { id_not_in: ["${id2}", "${id3}"] }`, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id_not_in - empty list',
    withKeystone(async ({ keystone }) => {
      const IDs = await getIDs(keystone);
      return match(keystone, 'where: { id_not_in: [] }', [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id_not_in - missing id',
    withKeystone(async ({ keystone, adapterName }) => {
      const IDs = await getIDs(keystone);
      const fakeID = adapterName === 'mongoose' ? '"0123456789abcdef01234567"' : 1000;
      return match(keystone, `where: { id_not_in: [${fakeID}] }`, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );
};
