#!/usr/bin/env python3
"""
JMDict字典文件拆分工具
将大的JSON文件拆分成多个小文件，以满足Git的文件大小限制
"""

import json
import os
import math
from pathlib import Path

def split_jmdict(input_file, output_dir, max_size_mb=80):
    """
    拆分JMDict JSON文件
    
    Args:
        input_file: 输入的JSON文件路径
        output_dir: 输出目录
        max_size_mb: 每个分片的最大大小（MB）
    """
    print(f"开始拆分文件: {input_file}")
    
    # 创建输出目录
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # 读取原始JSON文件
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    words = data.get('words', [])
    total_words = len(words)
    print(f"总词条数: {total_words}")
    
    # 估算每个分片应包含的词条数
    # 先计算原文件大小和平均每个词条的大小
    file_size_mb = os.path.getsize(input_file) / (1024 * 1024)
    avg_word_size = file_size_mb / total_words
    words_per_chunk = int(max_size_mb / avg_word_size)
    
    print(f"原文件大小: {file_size_mb:.2f} MB")
    print(f"平均每词条大小: {avg_word_size:.6f} MB")
    print(f"每个分片预计词条数: {words_per_chunk}")
    
    # 计算需要的分片数
    num_chunks = math.ceil(total_words / words_per_chunk)
    print(f"将拆分为 {num_chunks} 个文件")
    
    # 创建元数据文件
    metadata = {
        "total_chunks": num_chunks,
        "total_words": total_words,
        "words_per_chunk": words_per_chunk,
        "original_file": os.path.basename(input_file),
        "version": data.get('version', 'unknown'),
        "date": data.get('date', 'unknown')
    }
    
    metadata_file = output_path / "jmdict_metadata.json"
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"元数据文件已创建: {metadata_file}")
    
    # 拆分文件
    for i in range(num_chunks):
        start_idx = i * words_per_chunk
        end_idx = min((i + 1) * words_per_chunk, total_words)
        
        chunk_words = words[start_idx:end_idx]
        chunk_data = {
            "chunk_id": i,
            "total_chunks": num_chunks,
            "words_in_chunk": len(chunk_words),
            "start_index": start_idx,
            "end_index": end_idx - 1,
            "words": chunk_words
        }
        
        chunk_file = output_path / f"jmdict_chunk_{i:03d}.json"
        with open(chunk_file, 'w', encoding='utf-8') as f:
            json.dump(chunk_data, f, ensure_ascii=False, separators=(',', ':'))
        
        chunk_size_mb = os.path.getsize(chunk_file) / (1024 * 1024)
        print(f"分片 {i+1}/{num_chunks}: {chunk_file.name} ({len(chunk_words)} 词条, {chunk_size_mb:.2f} MB)")
    
    print("拆分完成!")
    return num_chunks

if __name__ == "__main__":
    input_file = "/Users/tetsuya/Dev/Fudoki4Web/static/libs/dict/jmdict-eng-3.6.1.json"
    output_dir = "/Users/tetsuya/Dev/Fudoki4Web/static/libs/dict/chunks"
    
    if os.path.exists(input_file):
        split_jmdict(input_file, output_dir)
    else:
        print(f"错误: 找不到输入文件 {input_file}")