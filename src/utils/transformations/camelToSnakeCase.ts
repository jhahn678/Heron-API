export default (camel: string): string => camel.replace(/[A-Z]/g, x => `_${x.toLowerCase()}`)
