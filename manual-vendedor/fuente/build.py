import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
from lib import story, toc_block, build, Spacer
story.append(Spacer(1, 1))  # cover page (drawn by template)
toc_block()
import c1, c2, c3, c4
build(sys.argv[1])
